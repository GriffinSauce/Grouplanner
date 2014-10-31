/* global $,moment,App,Group,Period */

/*
 *	input an id for creation
 *	an a ready function to call when loaded
 *
 */
function Group(data)
{
	var scope = this;
	
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
	
	// Save supplied data into this object
	for(var key in data)
	{
		scope[key] = data[key];
	}
}