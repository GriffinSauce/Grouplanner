/* global $,moment,App,Group,Period,Handlebars */

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
		var html;
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
			html = $(compiledTemplate(data));
		}else{
			var date = moment(scope.plannedDate, 'DDMMYYYY');
			var data = {
				id:this.startDate.format('DDMMYYYY'),
				day:date.format('dddd'),
				date:date.format('Do'),
				month:date.format('MMMM'),
				available:scope.getAvailableUsers(scope.plannedDate),
				notes:''
			};
			var compiledTemplate = Handlebars.getTemplate('planned');
			html = $(compiledTemplate(data));
		}

		// Attach events
		$('#avail-days .day',html).bind('click tap', scope.dayClicked);
		$('#avail-plan .go-btn',html).bind('click tap', scope.goClicked);
		$('.buttons .btn#replan',html).bind('click tap', scope.unPlan);
		$('.buttons .btn#addToCalendar',html).bind('click tap', scope.addToCalendar);

		return html;
	}
	
	/*
	 *	Get available users for a certain day
	 *
	 */
	this.getAvailableUsers = function(date)
	{
		var users = [];
		for(var key in app.group.members)
		{
			if(scope.days[date].available.indexOf(app.group.members[key]._id) !== -1)
			{
				users.push(app.group.members[key]);
			}
		}
		return users;
	};
	 
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
		
		if(el.parent().hasClass('doable'))
		{
			if(confirm("Planning the date! \nYou sure about that?"))
			{		
				console.log('Planning date: '+date);

				// Update data
				scope.plannedDate = date;
				scope.days[date].planned = true;

				// Update data to db
				var data = {
					periodid:scope.id,
					date:date,
					planned:true
				}
				socket.emit('put/planned', data, function(err) {
					console.log(err);
				});

				// Update UI
				var el = $('#'+scope.startDate.format('DDMMYYYY'));
				el.remove();
				$('#periods').append(scope.getHTML());
			}
		}else{
			alert("No can't do. \nYou need more than 50% available to plan a date.");
		}
	};
	
	/*	
	 *	Clickhandler for replan button
	 *
	 */
	this.unPlan = function()
	{
		if(confirm("Replanning the date \nYou sure about that?"))
		{
			if(confirm("Really? Because this is a major pain in the butt. Last chance."))
			{
				// Update data to db
				var data = {
					periodid:scope.id,
					date:false,
					planned:false
				}
				socket.emit('put/planned', data, function(err) {
					console.log(err);
				});

				// Update data
				scope.days[scope.plannedDate].planned = false;
				scope.plannedDate = false;

				// Update UI
				var el = $('#'+scope.startDate.format('DDMMYYYY'));
				el.remove();
				$('#periods').append(scope.getHTML());
			}
		}
	};

	/*
	 *	Clickhandler for addToCalendar button
	 *
	 */
	this.addToCalendar = function()
	{
		alert("Sorry, under construction.");
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
		$('#periods .period').hide();
		var el = $('#'+scope.startDate.format('DDMMYYYY'));
		var inDom = el.length !== 0;
		if(inDom)
		{
			el.show();
		}else{
			$('#periods').append(scope.getHTML());
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
				if(!scope.plannedDate)
				{
					scope.updateDays();
					scope.updatePicker();
				}else{
					var el = $('#'+scope.startDate.format('DDMMYYYY'));
					el.remove();
					var html = $(scope.getHTML());
					$('#periods').append(html);
				}
			}
		});
	};
	
	this.generateDays();
	this.updateData();
}
