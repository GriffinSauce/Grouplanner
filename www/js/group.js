/* global $,moment,App,Group,Period,document */

Handlebars.registerHelper("everyOther", function (index, amount, scope) {
	if ( ++index % amount )
		return scope.inverse(this);
	else
		return scope.fn(this);
});

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

		// Save
		localStorage.tab = t.data('target');
	});

	if(localStorage.tab !== undefined && localStorage.tab !== null)
	{
		var tab = localStorage.tab;

		// Tabs
		$('nav .tab').removeClass('active');
		$('nav .tab[data-target="'+tab+'"]').addClass('active');

		// Sections
		$('section').removeClass('active');
		$('section#'+tab).addClass('active');
	}

	$('.remove-user').bind('click tap', app.group.removeMember);
});
