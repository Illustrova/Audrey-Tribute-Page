var gulp = require("gulp");
var plumber = require("gulp-plumber");
var imagemin = require("gulp-imagemin");

//SVG: minify and combine to sprite
var svgmin = require("gulp-svgmin");
var svgstore = require("gulp-svgstore");

//SVG Fallback (create png sprite)
var spritesmith = require("gulp.spritesmith");
var merge = require("merge-stream");
var buffer = require("vinyl-buffer");

//1X(2X)-ICONS: convert svg to png
var svg2png = require("gulp-svg2png");
var rename = require("gulp-rename");

//COLORIZE
var colorize = require("gulp-colorize-svgs");
var cheerio = require("gulp-cheerio");

//REMOVETEMP
var del = require("del");

//Custom modules
var reporter  = require("../tasks/utils/reporter");
var config  = require("../tasks/_config.js");

//Minify svg and combine in sprite
gulp.task("svg", ["removetemp", "svg-fallback"], function() {
	return gulp.src(config.icons.svg.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(rename({ prefix: "icon-" }))
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
		.pipe(svgstore())
		.pipe(gulp.dest(config.icons.dest))
		.pipe(reporter.onSuccess)
		.pipe(browserSync.reload({ stream: true }));
});

//Create png sprites and css for @1x and @2x
gulp.task("svg-fallback", ["2x-icons"], function() {
	// Generate spritesheet
	var spriteData = gulp.src(config.icons.png.temp.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(spritesmith({
			imgName: "icons.png",
			imgPath: config.icons.dest + this.imgName,
			cssName: "icons.css",
			retinaSrcFilter: config.icons.png.temp.src.slice(0, -4) + "@2x.png",
			retinaImgName: "icons_2x.png",
			retinaImgPath: config.icons.dest + this.retinaImgName,
				cssOpts: {
					cssSelector: function (item) {
						// Hover icons to be named accordingly  (e.g. 'home-hover' -> 'home:hover')
						if (item.name.indexOf('-hover') !== -1) {
							//Add .no-svg class and hover selector for hover sprites
							return '.no-svg .icon-' + item.name.replace('-hover', ':hover');
						}
						else {
							return '.no-svg .icon-' + item.name;
						}
					}
				}
			})
		);
	// Pipe image stream through image optimizer and onto disk
	var imgStream = spriteData.img
		// DEV: We must buffer our stream into a Buffer for `imagemin`
		.pipe(buffer())
		.pipe(imagemin())
		.pipe(gulp.dest(config.icons.dest));

	// Pipe CSS stream through CSS optimizer and onto disk
	var cssStream = spriteData.css
		.pipe(gulp.dest(config.css.dest));

	// Return a merged stream to handle both `end` events
	return merge(imgStream, cssStream);
});

//Create png from svg
gulp.task("1x-icons", ["colorize"], function() {
	return gulp.src([config.icons.svg.src, config.icons.svg.temp.src])
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(svg2png({
			width: config.variables.iconWidth,
			height: config.variables.iconHeight
		}))
		.pipe(imagemin())
		.pipe(gulp.dest(config.icons.png.temp.dest + "/@1x/"));
});

//Create @2x retina png fallback icons
gulp.task("2x-icons", ["1x-icons"], function() {
	return gulp.src([config.icons.svg.src, config.icons.svg.temp.src])
		.pipe(plumber({errorHandler: reporter.onError}))
		.pipe(svg2png({
			width: config.variables.iconWidth * 2,
			height: config.variables.iconHeight * 2
		}))
		.pipe(rename({ suffix: "@2x" }))
		.pipe(imagemin())
		.pipe(gulp.dest(config.icons.png.temp.dest + "/@2x/"));
});

//Create colored svg for hover png fallback
gulp.task("colorize", function(){
	return gulp.src(config.icons.svg.src)
		.pipe(plumber({errorHandler: reporter.onError}))
		//Remove fill attributes - required for proper colorizing
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[data-old_color]').removeAttr('data-old_color');
			},
				parserOptions: { xmlMode: true }
		}))
		.pipe(colorize({
			colors: {
				// All files
				default: {
					hover: config.variables.iconHoverColor
				}
			},
			replaceColor: function(content, hex) {
				return content.replace(/<path/g, '<path fill="' + hex + '"');
			},
			replacePath: function(path, colorKey) {
				return path.replace(/\.svg/, '-' + colorKey + '.svg');
			}
		}))
		.pipe(gulp.dest(config.icons.svg.temp.dest));
});
//Clean up _temp directory
gulp.task("removetemp", function() { return del.sync('src/img/_temp/**/*'); });