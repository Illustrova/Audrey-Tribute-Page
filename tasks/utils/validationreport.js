// Options:
// @plugin (required) - name of plugin to process results. Currently available "w3cjs" and "w3c-css"
// @columns - array of objects, containing "name", "value" and "width"(optional) of column
// @ToConsole - object or false. Object  options: line, column, context, message exxpect a string with
// 	relative key in error object. Option "silence" let's not to log to console defined types of errors/warnings.
// 	They still will be  present in HTML report.
// Full example of Gulp pipe:
// 	.pipe(validationReport({plugin: "w3c-css",
//		title: "CSS Validation report",
// 		columns: [
// 		{name: "Line", value: "line"},
// 		{name: "Category", value: "type", width: 2},
// 		{name: "Description", value: "message", width: 5},
// 		{name: "Selector", value: "context", width: 2},
// 		{name: "Skipped string", value: "skippedString", width: 2}
// 		],
// 		toConsole: {
// 			line: "line",
// 			context: "skippedString",
// 			message: "message",
// 			silence: ["redefinition", "vendor-extension"],
// 		destFolder: "reports/validaton"
// 		}
// 	}));
// });

var gulp = require("gulp");
var newfile = require("gulp-file");
var through = require('through2');
var json2html = require('node-json2html');
var log = require('fancy-log');
var colors = require('ansi-colors');
var tmpl  = require('./reportTmpl.js');

function getByKeyValue(arr, key, value) {
	var result  = arr.filter(function(o){return o[key] == value;} );
	return result? result[0] : null; // or undefined
}

function htmlReport(options) {
	options = options || {};

	var stream = through.obj(function(file, enc, cb) {

		//define source object according to plugin
		if (options.plugin == "w3cjs") {
			json = file.w3cjs.messages;
		}
		else if (options.plugin == "w3c-css") {
			json = JSON.parse(file.contents.toString());
		}
		else {
			console.log("Plugin doesn't exist or not defined");
		}

		var results = {"errors": [], "warnings": []};

		//Check if plugin provides results in two objects
		if (json.errors || json.warnings) {
			results.errors = json.errors;
			results.warnings = json.warnings;
		}

		//If not, loop and collect to objects accordingly
		else {
			json.forEach(function (res) {
					if (res.type == "error") {
						results.errors.push(res);
					}
					else {
						results.warnings.push(res);
					}
			});
		}

		//If no errors or warnings found, log success and quit without creating a file.

		if (results.errors.length === 0 && results.warnings.length === 0) {
			cb();
			return log(colors.bggreen(colors.white('Success: ')), colors.blue(file.relative), colors.green("has no errors or warnings"));
		}

		//Get table header
		var columnTitles = [];
		options.columns.forEach(function(column) {
			columnTitles.push(column.name);
		});

		//Set transform setting for json2html
		var transformErrors = {"<>":"tr","class":"danger", "html": [{"<>":"td","html":"Error"}]};
		var transformWarnings = {"<>":"tr","class":"warning", "html": [{"<>":"td","html":"Warning"}]};

		columnTitles.forEach(function(title) {
			var obj = getByKeyValue(options.columns, "name", title);
			var transformObj = {"<>":"td"};

			if (obj.value) {
				transformObj.text = "${" + obj.value.toString() + "}";
			}

			if (obj.width) {
				transformObj.class = "col-md-" + obj.width;
			}

			transformErrors.html.push(transformObj);
			transformWarnings.html.push(transformObj);

		});

		//Add "Type" column
		columnTitles.unshift("Type");

		//Json2html
		var tableErrors = json2html.transform(results.errors, transformErrors);
		var tableWarnings = json2html.transform(results.warnings, transformWarnings);

		var tableBody = tableErrors + tableWarnings;

		var report = tmpl.pageHeader(options.title, columnTitles, file) + tableBody + tmpl.pageFooter;

		//Printing results to console
		if (options.toConsole) {
			results.errors.forEach(function(error){
				if ((options.toConsole.silence) && (!options.toConsole.silence.includes(error.type))) {//currently works for w3c-css
					log.error(colors.bold(colors.white(colors.bgred(' ERROR: '))),
						colors.blue(" in " + file.relative + ' '),
						colors.red(error[options.toConsole.line] ? "at line " + error[options.toConsole.line] : "" + error[options.toConsole.column] ? ":" + error[options.toConsole.column] + "\n" : "\n"),
						colors.grey(error[options.toConsole.context] ? error[options.toConsole.context] + '\n' : ''),
						colors.black(error[options.toConsole.message] ? error[options.toConsole.message] + '\n' : ''));
				}
			});
			results.warnings.forEach(function(error){
				if ((options.toConsole.silence) &&(!options.toConsole.silence.includes(error.type))) { //currently works for w3c-css
					log.warn(colors.bold(colors.white(colors.bgyellow(' WARNING: '))),
						colors.blue(" in " + file.relative + ' '),
						colors.red(error[options.toConsole.line] ? "at line " + error[options.toConsole.line] : "" + error[options.toConsole.column] ? ":" + error[options.toConsole.column] + "\n" : "\n"),
						colors.grey(error[options.toConsole.context] ? error[options.toConsole.context] + '\n' : ''),
						colors.black(error[options.toConsole.message] ? error[options.toConsole.message] + '\n' : ''));
				}
			});
		}

		else {
			log(colors.green("Validation report created in folder:" + options.destFolder));
		}

		cb();

		return newfile(file.relative + "-validation-report.html", report)
		.pipe(gulp.dest(options.destFolder));
	});

	// returning the file stream
	return stream;
}

module.exports = htmlReport;