var gulp           = require("gulp");
var browserSync    = require("browser-sync");

var config  = require("../tasks/_config.js");

gulp.task("watch", ["pug", "sass", "js", "inject-favicon-markups", "bs"], function() {
	gulp.watch(config.sass.src, ["css"]);
	gulp.watch([config.pug.src], ["pug"]);
	gulp.watch(config.icons.src, ["svg"]);
	gulp.watch([config.js.src, config.js.libs.src], ["js"]);
	gulp.watch(config.html.src, browserSync.reload);
});

gulp.task('default', ['watch']);