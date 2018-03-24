var gulp = require("gulp");
var plumber = require("gulp-plumber");
var runSequence = require('run-sequence');
var path = require("path");

//Images-html, images-css
var responsive = require("gulp-responsive");
var rename = require("gulp-rename");

//image-size-to-json
var tap = require("gulp-tap");
var normalize = require("normalize-path");
var sizeOf = require("image-size");
var newfile = require("gulp-file");

//CleanJSON
var del = require("del");

//Create placeholders
var fs = require('fs');
var exec = require('gulp-exec');
var log = require('fancy-log');
var changed = require('gulp-changed');
var svgmin = require("gulp-svgmin");

//Custom modules
var reporter  = require("../tasks/utils/reporter");
var config  = require("../tasks/_config.js");

//Get breakpoints and default width from external json
var breakpoints = Object.values(config.variables.breakpoints);
var defaultImageWidth = config.variables.defaultImageWidth;

//Unite all tasks in one
gulp.task("images", function(cb) {
	return runSequence(["images-html", "images-css"], "timeout", "image-size-to-json", cb);
});

gulp.task("images-html", function() {
	var responsiveConfig = [];
	breakpoints.forEach(function(media) {
		var mediaConfig = {
			width: media,
			rename: { suffix: "_" + media }
		};
		responsiveConfig.push(mediaConfig);
	});
	//Include fallback image
	responsiveConfig.push({
		width: defaultImageWidth,
		rename: { suffix: "" }
	});
	return gulp.src(config.img.inhtml.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(rename( function(path) {
			path.basename = path.basename.toLowerCase();
			path.basename = path.basename.replace(/[\s!=&\/\\#,+()$~%.'":*?<>{}@]/g,'-');
			return path;
		}))
		.pipe(responsive({
				"**": responsiveConfig
			},
			{
				//Global configuration for all images
				//The output quality for JPEG, WebP and TIFF output formats
				quality: 70,
				//Use progressive (interlace) scan for JPEG and PNG output
				progressive: true,
				//Strip all metadata
				withMetadata: false,
				//Silence enlargement warnings
				withoutEnlargement: true,
				skipOnEnlargement: false, // that option copy original file with/without renaming
				errorOnEnlargement: false,
				silent: true,
				stats: true
			}
		))
		.pipe(gulp.dest(config.img.dest));
});

gulp.task("images-css", function() {
	return gulp.src(config.img.incss.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(rename( function(path) {
			path.basename = path.basename.toLowerCase();
			path.basename = path.basename.replace(/[\s!=&\/\\#,+()$~%.'":*?<>{}@]/g,'-');
			return path;
		}))
		.pipe(responsive({
			"**": [
				{
					width: defaultImageWidth,
					rename: { suffix: "_1x" }
				},
				{
					width: defaultImageWidth * 2,
					rename: { suffix: "_2x" }
				},
				{
					width: defaultImageWidth * 1.5,
					rename: { suffix: "_15x" }
				}]
			},{
				//Global configuration for all images
				//The output quality for JPEG, WebP and TIFF output formats
				quality: 70,
				//Use progressive (interlace) scan for JPEG and PNG output
				progressive: true,
				//Strip all metadata
				withMetadata: false,
				//Silence enlargement warnings
				withoutEnlargement: true,
				skipOnEnlargement: false, // that option copy original file with/without renaming
				errorOnEnlargement: false,
				silent: true,
				stats: true
			}
		))
		.pipe(gulp.dest(config.img.dest));
});

//Pass info about image dimensions to data/images.json
gulp.task("image-size-to-json", ["cleanJSON"], function() {
	var images = {};
	return gulp.src([config.img.src + ".*", "!" + config.img.src + ".svg"])
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(tap(function(file) {
			var outputFileName = "images.json";

			var filePath = normalize(path.relative("src/", file.path));
			var extension = path.extname(filePath);
			var fileName = path.basename(filePath, extension);
			var dimensions = sizeOf("src/" + filePath);

			images[fileName] = {
				path: "'" + filePath.toLowerCase() + "'",
				width: dimensions.width,
				height: dimensions.height
			};
			//Optional wrapper - convenient for SASS
			var imagesOuter = { images: images };
			var exportJSON = JSON.stringify(imagesOuter, null, "\t");

			return newfile(outputFileName, exportJSON)
				.pipe(gulp.dest(config.data.dest));
		}));
});

//Helper task - delete existing json for proper update
gulp.task("cleanJSON", function() {
	return del.sync(config.data.images);
});

gulp.task("ph",["create-ph"], function() {
	return gulp.src(config.img.placeholders + "/*")
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(svgmin({
			plugins: [
				{
					removeViewBox: false
				},
				{
					removeDimensions: false
				},
				{
					removeUselessStrokeAndFill: false
				}
			]
		}))
		.pipe(gulp.dest(config.img.placeholders));
});

gulp.task('create-ph', function(){

	var destFiles = "src/img/placeholders";

	if (!fs.existsSync(destFiles)){
			fs.mkdirSync(destFiles);
	}
	function execPrim(outDir, options) {
		options = options || {};

		options._out = function(file) {
			var oldfile = file.relative;
			log("Processing:" + oldfile);
			var newfile = oldfile.substring(0, oldfile.indexOf("_"));
			return path.join(outDir, normalize(path.relative(path.dirname(newfile), newfile) + ".svg"));
		};

		options._primitives = 175;
		// Output an object to pipe into
		return exec('primitive -i <%= file.path %> -o <%= options._out(file) %> -n <%= options._primitives %> -m 1', options)
	};

	return gulp.src('src/img/**/*' + breakpoints[0] + '.{jpg, png}')
		.pipe(changed(destFiles))
		.pipe(execPrim(destFiles))
		.pipe(exec.reporter());
});