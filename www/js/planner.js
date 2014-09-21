
/*$('#calendar').clndr({
  template: $('#clndr-template').html()
});*/

function App()
{
	var scope = this;
	
	this.init = function()
	{
		
		var days = this.getDays();
		$('#avail-days').append(days);
		$('#avail-days .day').bind('click tap', this.dayClicked);
	
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
			var period = new Array(7);
			for(var i=0; i<7; i++)
			{
				period[i] = moment().day(i+1);
			}
		}
		
		// Build period HTML
		var periodHMTL = [];
		for(var i=0; i<period.length; i++)
		{
			var day = $('<div class="day"></div>');
			day.append('<div class="day-name">'+period[i].format('dd')+'</div>')
			day.append('<div class="day-date">'+period[i].format('DD')+'</div>')
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
		scope.updatePlanner();
	};
	
	this.updatePlanner = function()
	{
		// TODO: Update availability bars
		// TODO: Add Plan buttons on 100% days
	};
	
	
}

var app = new App();
app.init();