var gulp = require("gulp");
var plumber = require("gulp-plumber");
var pug = require("gulp-pug");
var runSequence = require("run-sequence");
//Custom modules
var reporter  = require("../tasks/utils/reporter");
var config  = require("../tasks/_config.js");
var browserSync = require("browser-sync");

function checkModule(path) {
	try {
		require.resolve(path);
		return true;
	} catch (er) {
		return false;
	}
}

//Check if data files used as "locals" available; if not, create them first
gulp.task("pug", function(cb) {
	var p = "../" + config.data.images;
	if (checkModule(p) === false) {
		return runSequence("image-size-to-json", "timeout", "pug-compile", cb);
	} else {
		return runSequence("pug-compile", cb);
	}
});

// Timeout task is needed only if the project is synced with Dropbox, otherwise it can be safely removed
gulp.task("timeout", function(done) {
	setTimeout(done, 3000);
});

gulp.task("pug-compile", function(cb) {
	var locals = {img: require("../" + config.data.images),
				config: require("../" + config.data.config)};
	return gulp.src(config.pug.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(pug({
			pretty: true, // Don't minify html
			locals: locals
		}))
		.pipe(browserSync.reload({ stream: true }))
		.pipe(gulp.dest(config.pug.dest));
});