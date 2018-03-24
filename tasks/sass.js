var gulp = require("gulp");
var plumber = require("gulp-plumber");
var browserSync = require("browser-sync");

//SASS
var sass = require("gulp-sass");
var jsonImporter = require('node-sass-json-importer');

//CSS
var concat = require("gulp-concat");
var autoprefixer = require("gulp-autoprefixer");

//Custom modules
var reporter  = require('../tasks/utils/reporter');
var config  = require("../tasks/_config.js");

//Include libs
gulp.task("css", ["sass"], function() {
	return gulp.src(config.css.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(sass({ importer: jsonImporter, outputStyle: "expand" }))
		.pipe(autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"]))
		.pipe(concat("main.min.css"))
		.pipe(gulp.dest(config.css.dest))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task("sass", function() {
	return gulp.src(config.sass.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(sass({ importer: jsonImporter, outputStyle: "expand" }))
		.pipe(gulp.dest(config.css.dest))
		.pipe(browserSync.reload({ stream: true }));
});