var gulp = require('gulp');
var plumber = require('gulp-plumber');
var del = require('del');
var runSequence = require('run-sequence');

//Minifiers
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var cssnano = require('gulp-cssnano');

//Custom modules
var reporter  = require('../tasks/utils/reporter');
var config  = require('../tasks/_config.js');

gulp.task('build', function(callback) {
	return runSequence('removedist',
		//Generate assets
		['images', 'svg'],
		['ph', 'generate-favicon'],
		//Copy created assets to build folder
		['build-fonts', 'build-images', 'build-favicon', 'build-icons'],
		//Process source files
		['css', 'pug', 'js'],
		//Modify
		['inject-favicon-markups'],
		//Minify and copy to build folder
		['build-css', 'build-js', 'build-html'],
		callback);
});

//Rebuild without assets
gulp.task('rebuild', function(callback) {
	return runSequence(
		//Process source files
		'pug',
		['css', 'js'],
		//Modify
		['inject-favicon-markups'],
		//Minify and copy to build folder
		['build-css', 'build-js', 'build-html'],
		callback);
});

//Make sure Dropbox is not running, otherwise the error might be thrown
gulp.task('clean-src', function() {
	return del.sync([
		config.css.dest,
		config.favicon.dest,
		config.img.dest,
		config.icons.dest,
		config.js.dest + '/*.min.js',
		"src/assets/_temp",
		config.html.dest + '/index.html']);
});

gulp.task('build-css', function() {
	gulp.src(config.css.dest + "/main.min.css")
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(cssnano())
		.pipe(gulp.dest(config.build.css));
});

gulp.task('build-js', function() {
	return gulp.src(config.js.dest + '/scripts.min.js')
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(uglify())
		.pipe(gulp.dest(config.build.js));

});

gulp.task('build-html', function() {
	return gulp.src(config.html.dest + '/*.html')
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(config.build.root));

});

//Fonts, favicon, images, icons
gulp.task('build-fonts', function() {
	return gulp.src(config.fonts.src)
		.pipe(gulp.dest(config.build.fonts));
});

gulp.task('build-images', function() {
	return gulp.src(config.img.src)
		.pipe(gulp.dest(config.build.img));
});

gulp.task('build-favicon', function() {
	return gulp.src(config.favicon.dest + '/**/*')
		.pipe(gulp.dest(config.build.favicon));
});

gulp.task('build-icons', function() {
	return gulp.src(config.icons.src)
		.pipe(gulp.dest(config.build.icons));
});

gulp.task('removedist', function() { return del.sync(config.build.root); });