/* global $,moment,App,Group,Period */

/*
 *	input an id for creation
 *	an a ready function to call when loaded
 *
 */
function Group(id, ready)
{
	var scope = this;
	
	// TODO: Get this stuff from database based on ID
	this.init = function()
	{
		socket.emit('get/group', {id:id}, function(data) {
			console.log('Group data loaded');
			
			// Save to localstorage in case another group was returned
			localStorage['groupid'] = data._id;
			
			// Save to scope
			for(var key in data)
			{
				scope[key] = data[key];
			}
			
			// done loading so call ready
			ready();
		});
	};
	
	// TODO: Build Add member function
	this.addMember = function()
	{
		
	};
	// TODO: Build Remove member function
	this.removeMember = function()
	{
		
	};
	// TODO: Build Delete group function
	this.delete = function()
	{
		
	};
	
	// Initialise
	this.init();
}