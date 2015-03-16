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
	});

	var nav = $('nav');
	var placeholder = $('.nav-placeholder');
	placeholder.height($('nav').outerHeight());
	var threshold = $('#header').outerHeight();
	threshold += $('.environment-label').outerHeight() !== null ? $('.environment-label').outerHeight() : 0;
	$(document).on("scroll", function() {
	  if ( $(this).scrollTop() > threshold) {
		nav.addClass("stick");
		placeholder.addClass("stick");
	  } else {
		nav.removeClass("stick");
		placeholder.removeClass("stick");
	  }
	});

	$('.remove-user').bind('click tap', app.group.removeMember);
});
