
/*$('#calendar').clndr({
  template: $('#clndr-template').html()
});*/

function App()
{

	this.init = function()
	{
		$('#avail-days .day').bind('click tap', this.dayClicked);
		console.log('APP INITIALISED');
	};
	
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
		this.updatePlanner();
	};
	
	this.updatePlanner = function()
	{
		// TODO: Update availability bars
		// TODO: Add Plan buttons on 100% days
	};
	
	
}

var app = new App();
app.init();