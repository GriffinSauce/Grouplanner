/* global $,moment */

// UserID
// TODO: Replace with the real deal after login
var userID = "Vla";

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
	this.group = new Group();
	
	// Period length
	// Default 7
	this.periodLength = this.group.length;
	
	// Data contains locally loaded periods, by startDate in DDMMYYYY format
	// Contains only this week by default
	this.data = {};
	this.data[this.activePeriod] = new Period({length:this.periodLength});
	
	/*	
	 *	Initialise the app
	 *
	 */
	this.init = function()
	{
		
		var days = this.getDays(this.data[this.activePeriod]);
		$('#avail-days').html(days);
		$('#avail-days .day').bind('click tap', this.dayClicked);
	
		$('.avail-control-button.next').bind('click tap', this.nextPeriod);
		$('.avail-control-button.prev').bind('click tap', this.prevPeriod);
		
		// Dummy data
		this.data[this.activePeriod].days[moment().weekday(1).format('DDMMYYYY')].availability = ["Frits","Joey","John","Klaas"];
		this.data[this.activePeriod].days[moment().weekday(2).format('DDMMYYYY')].availability = ["Joey","John","Klaas"];
		this.data[this.activePeriod].days[moment().weekday(3).format('DDMMYYYY')].availability = ["Frits","Joey"];
		this.data[this.activePeriod].days[moment().weekday(4).format('DDMMYYYY')].availability = ["Frits","Joey","John","Klaas"];
		this.data[this.activePeriod].days[moment().weekday(5).format('DDMMYYYY')].availability = ["Frits"];
		this.data[this.activePeriod].days[moment().weekday(6).format('DDMMYYYY')].availability = [];
		this.data[this.activePeriod].days[moment().weekday(7).format('DDMMYYYY')].availability = ["John","Klaas"];
		
		scope.updatePicker();
		
		console.log('APP INITIALISED');
	};
	
	/*	
	 *	getDays returns days in HTML for the given period
	 *	no period = this week
	 */
	this.getDays = function(period)
	{	
		// No period given, write this week
		if(!period)
		{
			period = new Period();
		}
		
		// Build period HTML
		var periodHMTL = [];
		for(var date in period.days)
		{
			var day = $('<div class="day"></div>');
			day.append('<div class="day-name">'+period.days[date].date.format('dd')+'</div>');
			day.append('<div class="day-date">'+period.days[date].date.format('DD')+'</div>');
			day.data('date',period.days[date].date.format('DDMMYYYY'));
			
			if(period.days[date].availability[userID] !== undefined && period.days[date].availability[userID] === true)
			{
				day.addClass('available');
			}
			
			periodHMTL.push(day);
		}
		
		return periodHMTL;
	};
	
	/*	
	 *	Clickhandler for days
	 *
	 */
	this.dayClicked = function()
	{
		var el = $(this);
		var date = el.data('date');
		
		// Update UI and data
		if(el.hasClass('available'))
		{
			el.removeClass('available');
			var i = scope.data[scope.activePeriod].days[date].availability.indexOf(userID);
			if(i != -1) {
				scope.data[scope.activePeriod].days[date].availability.splice(i, 1);	
			}
		}else{
			el.addClass('available');
			scope.data[scope.activePeriod].days[date].availability.push(userID);
		}
		
		// TODO: Update day to db
		
		scope.updatePicker();
	};
	
	/*	
	 *	Update date availability UI
	 *
	 */
	this.updatePlanner = function()
	{
		var p = scope.data[this.activePeriod];
		var days = scope.getDays(p);
		$('#avail-days').html(days);
		$('#avail-days .day').bind('click tap', scope.dayClicked);
		
		var startDay = p.startDate.format('D MMM');
		var endDay = p.endDate.format('D MMM');
		var periodName = startDay+' - '+endDay;
		$('#avail-controls .period span').text(periodName);
		
		scope.updatePicker();
	};
	
	/*	
	 *	Update date picking/planning UI
	 *
	 */
	this.updatePicker = function()
	{
		var days = scope.data[scope.activePeriod].days;
		for(var key in days)
		{
			days[key].percent = (days[key].availability.length / scope.group.members.length) * 100;
		}
		// TODO: Order according to percent
		var container = $('#avail-plan').empty();
		for(var key in days)
		{
			// TODO: Use Group's allowed-absense setting
			if(days[key].percent > 50)
			{
				// TODO: Use templates for crying out loud
				var day = $('<div class="day"></div>');
				day.append('<div class="label"><div class="day-name">'+days[key].date.format('dd')+'</div><div class="day-date">'+days[key].date.format('D')+'</div></div>');
				day.append('<div class="bar"><div class="bar-content" style="width:'+days[key].percent+'%;"></div></div>');
				day.append('<div class="go-btn">Go!</div>');
				if(days[key].percent === 100)
				{
					day.addClass('go');
				}
				container.append(day);
			}
		}
	};
	
	/*	
	 *	Switch to next period
	 *
	 */
	this.nextPeriod = function()
	{
		// Get next period in DDMMYYYY string
		scope.activePeriod = moment(scope.activePeriod, 'DDMMYYYY').add(scope.periodLength, 'd');
		
		// If Period doesn't exist, create new
		if(typeof scope.data[scope.activePeriod] === 'undefined')
		{
			scope.data[scope.activePeriod] = new Period({startDate:scope.activePeriod, length:scope.periodLength});
		}
		
		scope.updatePlanner();
	};
	
	/*	
	 *	Switch to previous period
	 *
	 */
	this.prevPeriod = function()
	{
		// Get next period in DDMMYYYY string
		scope.activePeriod = moment(scope.activePeriod, 'DDMMYYYY').subtract(scope.periodLength, 'd');
		
		// If Period doesn't exist, create new
		if(typeof scope.data[scope.activePeriod] === 'undefined')
		{
			scope.data[scope.activePeriod] = new Period({startDate:scope.activePeriod, length:scope.periodLength});
		}
		
		scope.updatePlanner();
	};
	
}

/*
 *	Period class
 *	options.startDate: 	The starting date in DDMMYYYY format 	default: Monday of this week, will be converted to Moment
 *	options.length:		The length of the period				default: 7 days
 */
function Period(options)
{
	var scope = this;
	
	// Defaults
	this.defaultOptions =
	{
		startDate:moment().weekday(1).format('DDMMYYYY'),
		length:7
	}
	// Prevent options undefined error
	options = typeof options !== 'undefined' ? options : scope.defaultOptions;
	// Set props based on options or defaults
	for(var prop in scope.defaultOptions)
	{
		scope[prop] = typeof options[prop]	!== 'undefined' ? options[prop]	: scope.defaultOptions[prop];
	}
	
	// Convert startDate to moment
	this.startDate = moment(this.startDate,'DDMMYYYY');
	
	// Set endDate
	this.endDate = this.startDate.clone().add(this.length,'d');
	
	/* 	
	*	Days in the period, contains array of objects:
	* 	{
	* 		date:Moment,
	* 		availability:
	* 		{
	* 			userID:boolean,
	* 			userID:boolean
	* 		},
	*		planned:boolean
	* 	}
	*/
	this.days = [];
	
	// Generate days
	this.generateDays = function()
	{
		this.days = []; // reset
		var dateTemp = this.startDate.clone();
		for(var i=0; i<this.length; i++)
		{
			this.days[dateTemp.format('DDMMYYYY')] = {
				date:dateTemp.clone(),
				availability:[],
				planned:false
			};
			dateTemp.add(1, 'd');
		}
	};
	
	this.generateDays();
	// TODO: Load actual data from db
}

/*
 *
 *
 *
 */
function Group(id)
{
	var scope = this;
	
	// Array holding the group members
	this.members = [];
	
	// TODO: Get this stuff from database based on ID
	this.init = function()
	{
		this.members = ["Vla","Frits","Joey","John","Klaas"];
		this.length = 7;
	}
	// TODO: Build Add member function
	this.addMember = function()
	{
		
	}
	// TODO: Build Remove member function
	this.removeMember = function()
	{
		
	}
	// TODO: Build Delete group function
	this.delete = function()
	{
		
	}
	
	// Initialise
	this.init();
}

var app = new App();
app.init();