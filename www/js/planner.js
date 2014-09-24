// default period object for dev purposes
// one week
var p = new Period();

function App()
{
	var scope = this;
	
	// Currently active period
	// Default to this week
	this.activePeriod = moment().format('DDMMYYYY');
	
	// Data contains locally loaded periods, by startDate in DDMMYYYY format
	// Contains only this week by default
	this.data = {};
	this.data[this.activePeriod] = new Period()
	
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
		for(var i=0; i<period.days.length; i++)
		{
			var day = $('<div class="day"></div>');
			day.append('<div class="day-name">'+period.days[i].format('dd')+'</div>')
			day.append('<div class="day-date">'+period.days[i].format('DD')+'</div>')
			periodHMTL.push(day)
		}
		
		return periodHMTL;
	}
	
	/*	
	 *	Clickhandler for days
	 *
	 */
	this.dayClicked = function()
	{
		var el = $(this);
		if(el.hasClass('available'))
		{
			el.removeClass('available');
		}else{
			el.addClass('available');
		}
		// TODO: Update day to db
		scope.updatePicker();
	};
	
	/*	
	 *	Update date picking UI
	 *
	 */
	this.updatePlanner = function()
	{
		var days = scope.getDays(p);
		$('#avail-days').html(days);
		$('#avail-days .day').bind('click tap', scope.dayClicked);
		
		var periodName = p.days[0].format('D MMM')+' - '+p.days[p.days.length-1].format('D MMM');
		$('#avail-controls .period span').text(periodName);
		
		scope.updatePicker();
	};
	
	this.updatePicker = function()
	{
		// TODO: Update availability bars
		// TODO: Add Plan buttons on 100% days
	}
	
	this.nextPeriod = function()
	{
		p.nextPeriod();
		scope.updatePlanner();
	}
	
	this.prevPeriod = function()
	{
		p.prevPeriod();
		scope.updatePlanner();
	}
	
}

function Period(startDate,length)
{
	var scope = this;
	
	// Default to this week
	this.startDate 	= typeof this.startDate !== 'undefined' ? this.startDate : moment().weekday(1).format('DDMMYYYY');
   	this.length 	= typeof this.length 	!== 'undefined' ? this.length 	 : 7;
	
	// Convert startDate to moment
	this.startDate = moment(this.startDate,'DDMMYYYY');
	
	// Days in the period, array of moments
	this.days = [];
	
	this.nextPeriod = function()
	{
		this.startDate.add(this.length,'d');
		this.generateDays();
	}
	
	this.prevPeriod = function()
	{
		this.startDate.subtract(this.length,'d');
		this.generateDays();
	}
	
	this.generateDays = function()
	{
		this.days = [];
		var dateTemp = this.startDate.clone();
		for(var i=0; i<this.length; i++)
		{
			this.days.push(dateTemp.clone());
			dateTemp.add(1, 'd');
		}
	}
	
	this.generateDays();
}

var app = new App();
app.init();