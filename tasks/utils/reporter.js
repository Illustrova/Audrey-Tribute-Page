var gulp = require('gulp');
var notify = require("gulp-notify");
var path = require('path');
var colors = require('ansi-colors');
var log = require('fancy-log');
var gulpif = require('gulp-if');

//by Jeffwa, https://stackoverflow.com/questions/25108262/error-handling-with-gulp-notify-and-gulp-plumber
var noErrors = true;

var reportSuccess = gulpif(noErrors, notify({
	appIcon: path.join(__dirname, 'images/success.png'),
	icon: path.join(__dirname, 'images/success.png'),
	title: "All good!",
	subtitle: "Gulp task finished successfully",
	message:  "<%= file.relative %> ready",
	wait: true,
	onLast: true
}));

// Inspired by Brendan Falkowski, https://github.com/mikaelbr/gulp-notify/issues/81
var reportError = function (error) {
	//console.log(error);
	noErrors = false;

	//Find correct data and pass to variables (error object properties are different depending on plugin)
	var errorLocation;

	if ((error.line) && (error.column)) { //Plumber
		errorLocation = 'LINE ' + error.line + ':' + error.column + ' -- ';
	}
	else if (error.lineNumber) { //JSValidate format, using Gulp plugin error reporting
		errorLocation = 'LINE ' + error.lineNumber + ':';
	}
	else {
		errorLocation = '';
	}

	var fileName;

	if (error.fileName) {  //JSValidate format, using Gulp plugin error reporting
		fileName = error.fileName.substring(error.fileName.lastIndexOf('\\')+1);
	}
	else if(error.relativePath) {
		fileName =  error.relativePath.substring(error.relativePath.lastIndexOf('\\')+1);

	}
	else if (error.filename) {
		fileName =  error.filename.substring(error.filename.lastIndexOf('\\')+1); //Pug
	}
	else {
		fileName = "unknown file";
	}

	var errorMessage;

	if (error.messageOriginal) {
		errorMessage = error.messageOriginal; //Plumber
	}
	else if (error.description) {
		errorMessage =  error.description.substring(error.description.indexOf(':')+1); ////JSValidate format, using Gulp plugin error reporting
	}
	else if (error.msg) {
		errorMessage = error.msg; //Pug
	}
	else {
		errorMessage =  error.toString();
	}

	var errorType = error.name;

	var pluginName = error.plugin || "";

	//Pop-up notifications
	notify({
		appIcon: path.join(__dirname, 'images/error.png'),
		icon: path.join(__dirname, 'images/error.png'),
		//title: "Houston, we have a  problem...",
		title: pluginName.toUpperCase() + " failed ",
		message: "See console",
		sound: 'Sosumi',
		wait: true,
	}).write(error);

	//Styled log to console
	if (errorType == "Error") {
		errorType = colors.bold(colors.white(colors.bgred(" " + errorType + " ")));
	}
	else if (errorType == "Warning") {
		errorType = colors.bold(colors.white(colors.bgyellow(" " + errorType + " ")));
	}
	else {
		errorType = colors.bold(colors.white(colors.bgcyan(" " + errorType + " ")));
	}

	log.error(errorType, colors.red(errorLocation), colors.blue(fileName), "\n",
		colors.black(errorMessage));

	// Prevent the 'watch' task from stopping
	this.emit('end');
};

module.exports = {
	onError: reportError,
	onSuccess: reportSuccess
};