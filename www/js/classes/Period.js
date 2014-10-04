/*
 *	Period class
 *	options.startDate: 	The starting date in DDMMYYYY format 	default: Monday of this week, will be converted to Moment
 *	options.length:		The length of the period				default: 7 days
 */
function Period(options)
{
	var scope = this;
	// Set props based on options or defaults
	this.defaultOptions ={
		startDate:moment().weekday(1).format('DDMMYYYY'),
		length:7
	}
	options = typeof options !== 'undefined' ? options : scope.defaultOptions; // Prevent options undefined error
	for(var prop in scope.defaultOptions)	
	{
		scope[prop] = typeof options[prop]	!== 'undefined' ? options[prop]	: scope.defaultOptions[prop];
	}
	
	// Convert startDate to moment
	this.startDate = moment(this.startDate,'DDMMYYYY');
	
	// Set endDate
	this.endDate = this.startDate.clone().add(this.length,'d');
	
	/* 	Days in the period, contains array of objects:
	* 	{
	* 		date:Moment,
	* 		availability:{ userID:boolean, userID:boolean },
	*		planned:boolean
	* 	}
	*/
	this.days = [];
	
	/*	
	 *	Generate day objects
	 */
	this.generateDays = function()
	{
		this.days = []; // reset
		var dateTemp = this.startDate.clone();
		for(var i=0; i<this.length; i++)
		{
			this.days[dateTemp.format('DDMMYYYY')] = {
				date:dateTemp.clone(),
				available:[],
				planned:false
			};
			dateTemp.add(1, 'd');
		}
	};
	
	/*	
	 *	getHTML returns days in HTML
	 */
	this.getHTML = function()
	{	
		// Build period HTML
		var periodHMTL = [];
		for(var date in scope.days)
		{
			var day = $('<div class="day"></div>');
			day.append('<div class="day-name">'+scope.days[date].date.format('dd')+'</div>');
			day.append('<div class="day-date">'+scope.days[date].date.format('DD')+'</div>');
			day.data('date',scope.days[date].date.format('DDMMYYYY'));
			
			if(scope.days[date].available.indexOf(userID) !== -1)
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
			var i = scope.days[date].available.indexOf(userID);
			if(i != -1) {
				scope.days[date].available.splice(i, 1);	
			}
		}else{
			el.addClass('available');
			scope.days[date].available.push(userID);
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
		var p = scope;
		var days = scope.getHTML();
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
		var days = scope.days;
		for(var key in days)
		{
			days[key].percent = (days[key].available.length / app.group.members.length) * 100;
		}
		// TODO: Order according to percent
		var container = $('#avail-plan').empty();
		for(var key in days)
		{
			// TODO: Use Group's allowed-absense setting
			if(days[key].percent >= 50)
			{
				// TODO: Use templates for crying out loud
				// TODO: Write whole week once, then only update existing DOM
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
	
	this.generateDays();
	this.updatePicker();
	// TODO: Load actual data from db
	
	// Add days to screen
	$('#avail-days').html(this.getHTML());
	$('#avail-days .day').bind('click tap', scope.dayClicked);
}