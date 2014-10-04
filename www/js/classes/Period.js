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
	
	this.generateDays();
	// TODO: Load actual data from db
}