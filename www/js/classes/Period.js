/* global $,moment,App,Group,Period */

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
	};
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
	* 		availability:[ userID, userID ],
	*		planned:boolean
	* 	}
	*/
	this.days = [];
	
	// Planned date, false or moment
	this.plannedDate = false;
	
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
	 *	Gets period html
	 */
	this.getHTML = function()
	{
		var data = {id:this.startDate.format('DDMMYYYY'),days:[]};
		for(var date in scope.days)
		{
			data.days.push({
				day:scope.days[date].date.format('dd'),
				date:scope.days[date].date.format('DD'),
				dateFull:date,
				available:scope.days[date].available.indexOf(userID) !== -1,
				percent:(scope.days[date].available.length / app.group.members.length) * 100
			});
		}
		var compiledTemplate = Handlebars.getTemplate('availability');
 		return compiledTemplate(data);
	}
	
	/*	
	 *	Clickhandler for days
	 *
	 */
	this.dayClicked = function()
	{
		var el = $(this);
		var date = el.attr('id');
		console.log('Changing availability on: '+date);
		
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
	 *	Clickhandler for go buttons
	 *
	 */
	this.goClicked = function()
	{
		var el = $(this);
		var date = el.parent().attr('id');
		console.log('Planning date: '+date);
		
		// Update data
		scope.plannedDate = moment(date, 'DDMMYYYY');
		scope.days[date].planned = true;
		// TODO: Update data to db
		
		// Update UI
		
	};
	
	/*	
	 *	Update day availability UI
	 *
	 */
	this.updateDays = function()
	{
		var days = scope.days;
		for(var key in days)
		{
			var day = $('#'+scope.startDate.format('DDMMYYYY')).find('#avail-days #'+key);
			if(days[key].available.indexOf(userID) !== -1)
			{
				day.removeClass('available').addClass('available');
			}else{
				day.removeClass('available');	
			}
		}
	};
	
	/*	
	 *	Update date planning UI
	 *
	 */
	this.updatePicker = function()
	{
		var days = scope.days;
		for(var key in days)
		{
			days[key].percent = (days[key].available.length / app.group.members.length) * 100;
			// TODO: Use Group's allowed-absense setting
			
			var day = $('#'+scope.startDate.format('DDMMYYYY')).find('#avail-plan #'+key);
			day.find('.bar-content').css({width: days[key].percent+'%'});
			
			day.removeClass('doable go');
			if(days[key].percent >= 50){ 	day.addClass('doable'); }
			if(days[key].percent === 100){	day.addClass('go');		}
		}
		// TODO: Order according to percent
	};
	
	this.activate = function()
	{
		$('#availability .period').hide();
		var el = $('#'+scope.startDate.format('DDMMYYYY'));
		var inDom = el.length !== 0;
		if(inDom)
		{
			el.show();
		}else{
			var html = $(scope.getHTML());
			$('#avail-days .day',html).bind('click tap', scope.dayClicked);
			$('#avail-plan .go-btn',html).bind('click tap', scope.goClicked);
			$('#availability').append(html);
		}
	};
	
	this.generateDays();
	// TODO: Load actual data from db
}