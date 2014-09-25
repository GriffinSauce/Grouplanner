/* global $,moment */

// UserID
// TODO: Replace with the real deal after login
var userID = "ITSAMEMARIO";

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
	
	// Period length
	// Default 7
	this.periodLength = 7;
	
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
			scope.data[scope.activePeriod].days[date].availability[userID] = false;
		}else{
			el.addClass('available');
			scope.data[scope.activePeriod].days[date].availability[userID] = true;
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
		// TODO: Update availability bars
		// TODO: Add Plan buttons on 100% days
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
	
	// Default to this week
	this.startDate 	= typeof options.startDate !== 'undefined' ? options.startDate : moment().weekday(1).format('DDMMYYYY');
   	this.length 	= typeof options.length 	!== 'undefined' ? options.length 	 : 7;
	
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
				availability:{},
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
function Group(members, options)
{
	var scope = this;
	
	// Defaults
	this.length = typeof options.length !== 'undefined' ? options.length  : 7;
	this.members = typeof members !== 'undefined' ? members  : [];
	
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
}

var app = new App();
app.init();