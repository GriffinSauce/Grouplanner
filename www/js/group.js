/* global $,moment,App,Group,Period */

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

});
