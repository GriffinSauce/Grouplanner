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
		if(!scope.plannedDate)
		{
			var data = {id:this.startDate.format('DDMMYYYY'),days:[]};
			for(var date in scope.days)
			{
				data.days.push({
					day:moment(date,'DDMMYYYY').format('dd'),
					date:moment(date,'DDMMYYYY').format('DD'),
					dateFull:date,
					available:scope.days[date].available.indexOf(app.user._id) !== -1,
					percent:(scope.days[date].available.length / app.group.members.length) * 100
				});
			}
			var compiledTemplate = Handlebars.getTemplate('availability');
			return compiledTemplate(data);
		}else{
			// TODO: Use real data
			var data = {
				id:this.startDate.format('DDMMYYYY'),
				day:'Monday',
				date:'09',
				month:'October',
				available:'Frits, Joey and Klaas',
				notes:'...'
			};
			var compiledTemplate = Handlebars.getTemplate('planned');
			return compiledTemplate(data);
		}
	}
	
	/*	
	 *	Clickhandler for days
	 *
	 */
	this.dayClicked = function()
	{
		var el = $(this);
		var date = el.attr('id');
		var available = null;
		console.log('Changing availability on: '+date);
		
		// Update UI and data
		if(el.hasClass('available'))
		{
			available = false;
			el.removeClass('available');
			var i = scope.days[date].available.indexOf(app.user._id);
			if(i != -1) {
				scope.days[date].available.splice(i, 1);	
			}
		}else{
			available = true;
			el.addClass('available');
			scope.days[date].available.push(app.user._id);
		}
		
		// Update day to db
		var data = {
			periodid:scope.id,
			date:date,
			available:available
		}
		socket.emit('put/available', data, function(err) {
			console.log(err);
		});
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
		var el = $('#'+scope.startDate.format('DDMMYYYY'));
		el.remove();
		var html = $(scope.getHTML());
 		$('#availability').append(html);
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
			if(days[key].available.indexOf(app.user._id) !== -1)
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
	
	/*	
	 *	Show this period in the UI
	 *
	 */
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
	
	/*	
	 *	Load data from db and update UI
	 *
	 */
	this.updateData = function()
	{
		var period = {
			groupid:app.group._id,
			startDate:scope.startDate.format('DDMMYYYY'),
			endDate:scope.endDate.format('DDMMYYYY')
		}
		socket.emit('get/period', period, function(data) {
			if(data)
			{
				// Save data
				scope.days = data.days;
				scope.id = data._id;
				if(typeof data.plannedDate !== 'undefined')
				{
					scope.plannedDate = data.plannedDate;
				}else{
					scope.plannedDate = false;
				}
				
				// Update UI
				scope.updateDays();
				scope.updatePicker();
			}
		});
	};
	
	this.generateDays();
	this.updateData();
}