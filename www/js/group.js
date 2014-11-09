/* global $,moment,App,Group,Period */

var socket = io();

var app = new App();
// Load this week
var thisWeek = moment().weekday(1).format('DDMMYYYY');
app.loadPeriod(thisWeek);

// header
$(document).ready(function(){
	
});