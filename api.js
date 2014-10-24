#!/bin/env node

// Imports
var Period = require(__dirname + '/db/period.js');
var Group = require(__dirname + '/db/group.js');
var io = global.grouplanner.io;

/*
 *	Command structure:	'method/resource'
 *	methods:	create,update,get,delete
 *	resource can be an element (eg. a group) or a collection (eg. groups)
 *
 *	ALLWAYS supply a callback, otherwise you WILL get a crash
 *	TODO: handle this more graciously
 */

// Object containing all functions
var apiFunctions = {

	/*	
	 *	Get group
	 *	input.id = group id
	 */
	'get/group' : function(input,callback)
	{
		Group.findOne({_id: input.id}, function(err, group)
		{
			callback(group);
		});
	},
	
	/*	
	 *	Create group
	 *	input.group = group data
	 *	input.user = current user
	 */
	'create/group' : function(input,callback)
	{
		// TODO: Check whether user is logged in
		// On the other hand, the page is not available if not...
		var group = new Group(input.group);
		group.creator = input.user._id;
		group.members.push(input.user._id);
		require('crypto').randomBytes(48, function(ex, buf)
		{
			group.token = buf.toString('hex');
			group.save(function(err)
			{
				if(err) { console.log('Error saving group %s to the database', group.name); }
				else { console.log('Group %s saved to the database', group.name); }
				callback({success:true, id:group._id, message: 'saved as: ' + group._id + '\n'});
			});
		});
	},
	
	/*	
	 *	Get period
	 *	input.startDate = period startDate
	 */
	'get/period' : function(input,callback)
	{
		Period.findOne({startDate: input.startDate}, function(err, period)
		{
			callback(period);
		});
	},
	
	/*	
	 *	Create period
	 *	input.period = period data
	 */
	'create/period' : function(input,callback)
	{
		// TODO: Check whether user is logged in
		// On the other hand, the page is not available if not...
		var period = new Period(input.period);
		period.save(function(err)
		{
			if(err) { console.log('Error saving group %s to the database', period.name); }
			else { console.log('Period %s saved to the database', period.name); }
			callback({success:true, startDate:period.startDate, message: 'saved as: ' + period.startDate + '\n'});
		});
	}
};

// Export for use in server.js
module.exports = apiFunctions;
  
// Socket listeners
io.on('connection', function (client)
{
	console.log('Socket IO is listening');
	for(var key in apiFunctions)
	{
		client.on(key, apiFunctions[key]);
	}
});
