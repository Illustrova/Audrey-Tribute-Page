// Timeout task is needed only if the project is synced with Dropbox, otherwise it can be safely removed
gulp.task("timeout", function(done) {
	setTimeout(done, 3000);
});