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
	
	/*	
	 *	Initialise the app
	 *
	 */
	this.init = function()
	{
		$('.avail-control-button.next').bind('click tap', this.nextPeriod);
		$('.avail-control-button.prev').bind('click tap', this.prevPeriod);
		
		this.data[this.activePeriod] = new Period({length:this.periodLength});
		
		// Dummy data
		this.data[this.activePeriod].days[moment().weekday(1).format('DDMMYYYY')].available = ["Frits","Joey","John","Klaas"];
		this.data[this.activePeriod].days[moment().weekday(2).format('DDMMYYYY')].available = ["Joey","John","Klaas"];
		this.data[this.activePeriod].days[moment().weekday(3).format('DDMMYYYY')].available = ["Frits","Joey"];
		this.data[this.activePeriod].days[moment().weekday(4).format('DDMMYYYY')].available = ["Frits","Joey","John","Klaas"];
		this.data[this.activePeriod].days[moment().weekday(5).format('DDMMYYYY')].available = ["Frits"];
		this.data[this.activePeriod].days[moment().weekday(6).format('DDMMYYYY')].available = [];
		this.data[this.activePeriod].days[moment().weekday(7).format('DDMMYYYY')].available = ["John","Klaas"];
		
		this.data[this.activePeriod].updatePicker();
		
		console.log('APP INITIALISED');
	};
	
	/*	
	 *	Switch to next period
	 *
	 */
	this.nextPeriod = function()
	{
		// Get next period in DDMMYYYY string
		scope.activePeriod = moment(scope.activePeriod, 'DDMMYYYY').add(scope.periodLength, 'd').format('DDMMYYYY');
		
		// If Period doesn't exist, create new
		if(typeof scope.data[scope.activePeriod] === 'undefined')
		{
			scope.data[scope.activePeriod] = new Period({startDate:scope.activePeriod, length:scope.periodLength});
		}
		
		scope.updatePlanner();
		scope.updatePicker();
	};
	
	/*	
	 *	Switch to previous period
	 *
	 */
	this.prevPeriod = function()
	{
		// Get next period in DDMMYYYY string
		scope.activePeriod = moment(scope.activePeriod, 'DDMMYYYY').subtract(scope.periodLength, 'd').format('DDMMYYYY');
		
		// If Period doesn't exist, create new
		if(typeof scope.data[scope.activePeriod] === 'undefined')
		{
			scope.data[scope.activePeriod] = new Period({startDate:scope.activePeriod, length:scope.periodLength});
		}
		
		scope.updatePlanner();
		scope.updatePicker();
	};
	
}