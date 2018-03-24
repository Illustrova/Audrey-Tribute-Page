var gulp = require("gulp");
var plumber = require("gulp-plumber");
var runSequence = require('run-sequence');
var del = require('del');
//Validation
var w3cjs = require('gulp-w3cjs');
var validate = require('gulp-w3c-css');
var jsValidate = require('gulp-jsvalidate');
//Unused images
var unusedImages = require('gulp-unused-images');
//Link-checker
var Q = require("q");
var colors = require('ansi-colors');
var log = require('fancy-log');
var fs = require('fs');
var blc = require("broken-link-checker");
var path = require('path');
var bs    = require('browser-sync').create();
var argv = require('yargs').argv;
//Build size
const size = require('gulp-size');
//Custom modules
var reporter  = require('../tasks/utils/reporter');
var validationReport  = require('../tasks/utils/validationreport.js');
var config  = require("../tasks/_config.js");
//Report template
var tmpl  = require('./utils/reportTmpl.js');

//Run tests. Default - run on dev. For build use flag --build
gulp.task('test', function(callback) {
	return runSequence('clean-reports', ['validate-js', 'validate-css', 'validate-html'],
		'link-checker', 'unused-img', argv.build ? 'lighthouse-build' : 'lighthouse', argv.build ? 'build-total-size' : callback);
});

gulp.task('clean-reports', function() {
	return del.sync(config.reports);
});
//Validation
gulp.task("validate-js", function() {
	return gulp.src((argv.build ?  config.build.js : config.js.dest) + "/**/*.js")
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(jsValidate());
});

gulp.task("validate-html", function() {
	return gulp.src((argv.build ? config.build.root : config.html.dest) + "/**/*.html")
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(w3cjs())
		.pipe(validationReport({plugin: "w3cjs",
			title: "HTML Validation Report",
			columns: [
			{name: "Line", value: "lastLine", width: 1},
			{name: "Description", value: "message", width: 6},
			{name: "Skipped string", value: "extract", width: 4}
			],
			toConsole: {
				line: "lastLine",
				message: "message",
				context: "extract"
			},
			destFolder: "reports/validaton"
		}));
});

gulp.task('validate-css', function() {
	return gulp.src((argv.build ? config.build.css : config.css.dest) + "/**/*.css")
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(validate({sleep: 1500}))
		.pipe(validationReport({plugin: "w3c-css",
			title: "CSS Validation Report",
			columns: [
			{name: "Line", value: "line"},
			{name: "Category", value: "type", width: 2},
			{name: "Description", value: "message", width: 5},
			{name: "Selector", value: "context", width: 2},
			{name: "Skipped string", value: "skippedString", width: 2}
			],
			toConsole: {
				line: "line",
				context: "skippedString",
				message: "message",
				silence: ["redefinition", "vendor-extension"]
			},
			destFolder: "reports/validaton"
			}
		));
});

//Check for unused images
gulp.task('unused-img', function () {
	return gulp.src([(argv.build ? config.build.root  : config.src.root) + "**/*",
		(argv.build ? config.build.css : config.css.dest) + "**/*",
		(argv.build ? config.build.img : config.img.dest) + "**/*"])
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(unusedImages())
		.pipe(plumber.stop());
});

//Print build size to console
gulp.task('build-total-size', ['build-size-js', 'build-size-css', 'build-size-html'], function() {
	gulp.src(config.build.root + '/**/*')
		.pipe(size({title: "Build size", showTotal: true, prettySize: true} ))
		.pipe(gulp.dest(config.build.root));
	}
);

gulp.task('build-size-html', function() {
	gulp.src(config.build.root + '/**/*.html')
		.pipe(size({title: "HTML", showTotal: false, showFiles: true, prettySize: true} ))
		.pipe(gulp.dest(config.build.root));
	}
);

gulp.task('build-size-css', function() {
	gulp.src(config.build.css + '/**/*')
		.pipe(size({title: "CSS", showFiles: true, showTotal: true, prettySize: true} ))
		.pipe(gulp.dest(config.build.css));
	}
);

gulp.task('build-size-js', function() {
	gulp.src(config.build.js + '/**/*')
		.pipe(size({title: "JS", showFiles: true, showTotal: true, prettySize: true} ))
		.pipe(gulp.dest(config.build.js));
	}
);

//Adapted from: https://github.com/sridevgit/angular.io/blob/d057f73c02bdb396a5825aab2d92d8e05e8a65d3/gulpfile.js
// Usage: gulp link-checker --url=[url] (default = localhost:3000)
gulp.task('link-checker', function(done) {
	var method = 'get'; // the default 'head' fails for some sites
	var exclude = [];
	var blcOptions = { requestMethod: method, excludedKeywords: exclude};

	bs.init({
		server: {
			baseDir: argv.build ? './' + config.build.root :'./' + config.src.root
		},
		logLevel: "warn",
		notify: false,
		open: false
	});
	return linkChecker({ blcOptions: blcOptions })
});

//Link-checker
function linkChecker(options) {
	var outputFile = path.join("reports", 'broken-links.html');
	var deferred = Q.defer();
	var options = options || {};

	var blcOptions = options.blcOptions || {};
	var customData = options.customData || {};

	// don't bother reporting bad links matching this RegExp
	var excludeBad = options.excludeBad || '';

	var previousPage;
	var siteUrl =  argv.url || options.url || 'http://localhost:3000';

	//store all results here
	var report = [];

	// See https://github.com/stevenvachon/broken-link-checker#blcsitecheckeroptions-handlers
	var handlers = {
		robots: function(robots, customData){},
		html: function(tree, robots, response, pageUrl, customData){
			log('Scanning ' + pageUrl);
		},
		junk: function(result, customData){},

		// Analyze links
		link: function(result, customData){
			if (!result.broken) { return; }
			if (excludeBad && excludeBad.test(result.url.resolved)) { return; }

			var currentPage = result.base.resolved;
			if (previousPage !== currentPage) {
				previousPage = currentPage;
				log('Broken links at page: ' + colors.cyan(currentPage));
			}

			log.error(colors.bold(colors.white(colors.bgred(' [' + result.brokenReason + '] ')))
			+ ' ' + result.url.resolved + colors.green(' at line ' + result.html.location.line));

			report.push({
				error: result.brokenReason,
				page: currentPage,
				link: result.url.resolved,
				tag: result.html.tag,
				line: result.html.location.line
			});
		},

		page: function(error, pageUrl, customData){},
		site: function(error, siteUrl, customData){},

		end: function(){
			var stopTime = new Date().getTime();
			var elapsed = 'Elapsed link-checking time: ' + ((stopTime - startTime)/1000) + ' seconds';
			log(elapsed);
			if (report.length > 0) {
				fs.writeFileSync(outputFile, tmpl.page("Broken links report", report));
				log('Output in file: ' + outputFile);
			}
			else {
				bs.exit();
				deferred.resolve(true);
			}
		}
	};

	// Log info
	var info = 'Link checker results for: ' + siteUrl +
							 '\nStarted: ' + (new Date()).toLocaleString() +
							 '\nExcluded links (blc file globs): ' + blcOptions.excludedKeywords +
							 '\nExcluded links (custom --exclude-bad regex): ' + excludeBad.toString();
	log(info);

	var siteChecker = new blc.SiteChecker(blcOptions, handlers);
	var startTime = new Date().getTime();

	try {
		log('link checker started');
		siteChecker.enqueue(siteUrl, customData);
	} catch (err) {
		log('link checker died');
		console.error('link checker died', err);
		deferred.reject(err);
	}
	return deferred.promise;
}