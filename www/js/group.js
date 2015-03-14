/* global $,moment,App,Group,Period */

var socket = io();

var app = new App();
// Load this week
var thisWeek = moment().weekday(1).format('DDMMYYYY');
app.loadPeriod(thisWeek);

// header
$(document).ready(function(){
	$('nav .tab').bind('click tap', function(e){
		var t = $(this)

		// Tabs
		$('nav .tab').removeClass('active');
		t.addClass('active');

		// Sections
		$('section').removeClass('active');
		$('section#'+t.data('target')).addClass('active');
	});
});
