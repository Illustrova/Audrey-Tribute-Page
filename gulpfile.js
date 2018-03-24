var gulp = require("gulp");
var requireDir = require("require-dir");
var browserSync = require("browser-sync").create();

global.browserSync = browserSync;

requireDir("./tasks", { recurse: false });

gulp.task("default", ["watch"]);