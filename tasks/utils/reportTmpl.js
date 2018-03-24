var json2html = require('node-json2html');

var pageHeader = function(title, columnTitles, file) {
	var  tableHeader = columnTitles.map(function(title) {
			return "<th>" + title + "</th>";
	});
	tableHeader = tableHeader.join('');

	var pageTitle = title + (file ? " for " + file.relative : "");
	return '\
			<!doctype html>\
			<html lang="en">\
			<head>\
				<meta charset="utf-8">\
				<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">\
				<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">\
				<link rel="stylesheet" href="https://cdn.datatables.net/1.10.16/css/dataTables.bootstrap.min.css">\
				<title>' + title + '</title>\
			</head>\
			<body style="padding: 20px">\
			<h1 class="text-center text-primary">'  + pageTitle + '</h1>\
			<table id="report" class="table table-hover table-bordered" cellspacing="0" width="100%">\
				<thead>\
					<tr>' + tableHeader + '</tr>\
				</thead>\
				<tfoot>\
					<tr>' + tableHeader + '</tr>\
				</tfoot>\
				<tbody>'
			};

var pageFooter = '\
				</tbody>\
			</table>\
			<script src=\"https://code.jquery.com/jquery-1.12.4.js\"></script>\
			<script src=\"https://cdn.datatables.net/1.10.16/js/jquery.dataTables.min.js\"></script>\
			<script src=\"https://cdn.datatables.net/1.10.16/js/dataTables.bootstrap.min.js\"></script>\
			<script>\
				$(document).ready(function() \{\
					$("#report").DataTable({\
							"lengthMenu": [[-1, 10, 25, 50], ["All", 10, 25, 50]]\
					} );\
			\} );\
			</script>\
			</body>\
			</html>';

//@ param data - array of objects with data
var pageBody = function(data, columnTitles) {
	if (data.length < 1) {
		console.log("You passed empty data object");
		return false;
	}

	//Calculate length of output and find optimal column width
	var sizes = {};
	columnTitles.forEach(function(title) {
		var allValues = data.map(function(obj) {
			return obj[title].toString().length;
		});
		averageLength = allValues.reduce(function(a, b) {
				return a + b;
		}) / allValues.length;
		sizes[title] = averageLength;
	});
	//Get total average length
	var total = Object.values(sizes).reduce(function(a, b) {
		return a + b;
	});

	//Calculate sizes to Bootstrap width (12 columns)
	for(var key in sizes) {
		if(sizes.hasOwnProperty(key)) {
			sizes[key] = Math.ceil(sizes[key] / (total/12));
			//Keep only low values in order to keep flexibility
			if (sizes[key] > 6) {
				sizes[key] = null;
			}
		}
	}

	//Create transform object for json2html
	var transformPattern = {"<>":"tr","class":"danger", "html": []};
	columnTitles.forEach(function(title) {
		var transformObj = {"<>":"td", "text": "${" + title.toString() + "}" };
		if (sizes[title] !== null) {
			transformObj.class = "col-md-" + sizes[title];
		}
		transformPattern.html.push(transformObj);
	});

	return json2html.transform(data, transformPattern);
}

var page = function(title, data) {
	var columnTitles = Object.keys(Object.assign({}, ...data));
	//Prettify keys to use as column headers
	var columnTitlesPrettyfied = columnTitles.map(function(title) {
		//Capitalize first letter
		var newTitle = title.charAt(0).toUpperCase() + title.slice(1)
		//Add spaces
		newTitle = newTitle.split(/(?=[A-Z])/).join(" ");
		return newTitle;
	});
	return pageHeader(title, columnTitlesPrettyfied) + pageBody(data, columnTitles) + pageFooter;
}

module.exports = {
	pageHeader: pageHeader,
	pageFooter: pageFooter,
	pageBody: pageBody,
	page: page
}