/* global $,moment,App,Group,Period,jshare,localStorage */

/*
 *	App class
 *
 */
function App()
{
	var scope = this;
	
	// Currently active period
	// Default to this week
	this.activePeriod = moment().format('DDMMYYYY');
	
	// Currently active group
	// TODO: Supply Group ID (from select, localstorage or default for the user)
	// TODO: Remove dummy
	this.group = {};
	
	// Period length
	// Default 7
	this.periodLength = this.group.length;
	
	// Data contains locally loaded periods, by startDate in DDMMYYYY format
	// Contains only this week by default
	this.data = {};
	
	// User data
	this.user = {};
	
	// Ready handlers
	this.readyHandlers = [];
	
	/*	
	 *	Initialise the app
	 *
	 */
	this.init = function()
	{
		$('.period-control-button.next').bind('click tap', this.nextPeriod);
		$('.period-control-button.prev').bind('click tap', this.prevPeriod);
		
		// Get data that is supplied with jshare
		scope.user = jshare.user;
		scope.group = new Group(localStorage['groupid'], function(){	
			scope.periodLength = scope.group.periodLength;
			for(var key in scope.readyHandlers)
			{
				scope.readyHandlers[key]();
			}
			console.log('APP INITIALISED');
		});
	};
	
	/*	
	 *	Add readyhandler
	 *
	 */
	this.ready = function(fn)
	{
		scope.readyHandlers.push(fn);	
	};
	
	/*	
	 *	Load a particular period
	 *	Input a startDate as a DDMMYYYY string
	 */
	this.loadPeriod = function(p)
	{
		this.activePeriod = p;
		// TODO: get data from DB
		// If Period doesn't exist, create new
		if(typeof scope.data[scope.activePeriod] === 'undefined')
		{
			scope.data[scope.activePeriod] = new Period({startDate:scope.activePeriod, length:scope.periodLength});
		}
		scope.data[scope.activePeriod].activate();
		scope.updateName();
	};
		
	/*	
	 *	Switch to next period and load
	 *
	 */
	this.nextPeriod = function()
	{
		console.log('Loading next period');
		// Get next period in DDMMYYYY string
		var next = moment(scope.activePeriod, 'DDMMYYYY').add(scope.periodLength, 'd').format('DDMMYYYY');
		scope.loadPeriod(next);
	};
	
	/*	
	 *	Switch to previous period and load
	 *
	 */
	this.prevPeriod = function()
	{
		console.log('Loading previous period');
		// Get next period in DDMMYYYY string
		var prev = moment(scope.activePeriod, 'DDMMYYYY').subtract(scope.periodLength, 'd').format('DDMMYYYY');
		scope.loadPeriod(prev);
	};
	
	/*	
	 *	Update period display
	 *
	 */
	this.updateName = function()
	{
		// Update period name display
		var startDay = scope.data[scope.activePeriod].startDate.format('D MMM');
		var endDay = scope.data[scope.activePeriod].endDate.format('D MMM');
		var periodName = startDay+' - '+endDay;
		$('#period-controls .period span').text(periodName);
	};
	
	this.init();
}