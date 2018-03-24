var gulp = require("gulp");
var plumber = require("gulp-plumber");
var concat = require("gulp-concat");
var browserSync = require("browser-sync");
//Custom modules
var config  = require("../tasks/_config.js");
var reporter  = require("../tasks/utils/reporter");

gulp.task("js", ["common-js"], function() {
	return gulp.src([config.js.libs.src, config.js.src])
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(concat("scripts.min.js"))
		.pipe(gulp.dest(config.js.dest))
		.pipe(browserSync.reload({ stream: true }));

});

gulp.task("common-js", function() {
	return gulp.src(config.js.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(concat("common.min.js"))
		.pipe(gulp.dest(config.js.dest));
});