/* global $,moment,App,Group,Period,document */

Handlebars.registerHelper("everyOther", function (index, amount, scope) {
	if ( ++index % amount )
		return scope.inverse(this);
	else
		return scope.fn(this);
});

var socket = io();

var group = new Group();
// Load this week
var thisWeek = moment().weekday(1).format('DDMMYYYY');
group.loadPeriod(thisWeek);

// header
$(document).ready(function(){

});
