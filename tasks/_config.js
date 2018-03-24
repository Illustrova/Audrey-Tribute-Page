//Import global variables
var vars = require("../src/data/variables.json");

module.exports = {
	pug: {
		src: "src/pug/index.pug",
		dest: "src"
	},
	sass: {
		src: "src/sass/main.sass",
		dest: "src/sass"
	},
	html: {
		src: "src/index.html",
		dest: "src"
	},
	css: {
		src: "src/css/main.css",
		dest: "src/css",
		libs: {
			src: "src/libs/**/*.css"
		}
	},
	js: {
		src: "src/js/common.js",
		dest: "src/js",
		libs: {
			src: "src/libs/**/*.js"
		}
	},
	img: {
		inhtml: {
			src: "src/assets/img/inhtml/**/*.{jpg,png}",
		},
		incss: {
			src: "src/assets/img/incss/**/*.{jpg,png}",
		},
		placeholders: "src/img/placeholders",
		src: "src/img/**/*",
		dest: "src/img"
	},
	icons: {
		svg: {
			src: "src/assets/icons/**/*.svg",
			temp: {
				src: "src/assets/_temp/icons/svg/**/*.svg",
				dest: "src/assets/_temp/icons/svg"
			}
		},
		png: {
			temp: {
				src: "src/assets/_temp/icons/png/**/*.png",
				dest: "src/assets/_temp/icons/png"
			}
		},
		deco: "src/icons/deco/**/*.svg",
		src: "src/icons/**/*",
		dest: "src/icons"
	},
	favicon: {
		src: "src/assets/favicon/favicon.jpg",
		dest: "src/favicon"
	},
	data: {
		images: "src/data/images.json",
		config: "src/data/config.json",
		dest: "src/data"
	},
	fonts: {
		src: "src/fonts/**/*",
		dest: "src/fonts"
	},
	libs: {
		js: {
			src: "src/libs/**/*.js"
		},
		css: {
			src: "src/libs/**/*.css"
		}
	},
	browsersync: {
		tunnel: false
	},
	src: {
		root: "src"
	},
	build: {
		root: "build",
		css: "build/css",
		js: "build/js",
		img: "build/img",
		fonts: "build/fonts",
		favicon: "build/favicon",
		icons: "build/icons"

	},
	reports: "reports",
	variables: vars
};