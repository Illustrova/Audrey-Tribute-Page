var gulp           = require('gulp');
var browserSync    = require('browser-sync').create();
var config  = require("../tasks/_config.js");
var argv = require('yargs').argv;
var ngrok = require('ngrok');

gulp.task('bs', function() {
	browserSync.init({
		server: {
			baseDir: argv.build ? './' + config.build.root :'./' + config.src.root
		},
		notify: false,
		tunnel: (function() {if (config.browsersync.tunnel) {return config.browsersync.tunnel;} else {return false;}})()
	}, function(err, bs) {
		ngrok.connect({
			authtoken: '2iw4CVupptWBffZjNmZC3_2ahysKNo6PfFRmFew3pGw',
			//httpauth: 'login:password',
			port: 3000
		}, function(err, url) {
			console.log(' -------------------------------------');
			console.log('\r', '      NGROK:', url);
			console.log(' -------------------------------------');
			if (err) {
				console.log( err );
			}
		});
	});
});