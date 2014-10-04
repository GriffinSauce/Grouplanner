/*
 *
 *
 *
 */
function Group(id)
{
	var scope = this;
	
	// Array holding the group members
	this.members = [];
	
	// TODO: Get this stuff from database based on ID
	this.init = function()
	{
		this.members = ["Vla","Frits","Joey","John","Klaas"];
		this.length = 7;
	}
	// TODO: Build Add member function
	this.addMember = function()
	{
		
	}
	// TODO: Build Remove member function
	this.removeMember = function()
	{
		
	}
	// TODO: Build Delete group function
	this.delete = function()
	{
		
	}
	
	// Initialise
	this.init();
}