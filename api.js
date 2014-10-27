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
	'create/group' : function(input, callback)
	{
		var group = new Group(input.group);
		group.creator = this.passport.user._id;
		group.members.push(this.passport.user._id);
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
	 *	input.groupid = _id of the group this period is part of
	 */
	'get/period' : function(input,callback)
	{
		Period.findOrCreate({startDate: input.startDate, groupid: input.groupid}, function(err, period, created)
		{
			if(created)
			{
				Group.findOne({_id: input.groupid}, function(err, group)
				{
					var days = {};
					for(var i = 0; i < group.periodLength; i++)
					{
						var datum = input.startDate;
						// datum x i
						days[datum].available = [];
						days[datum].planned = false;
					}
					period.days = days;
					period.save(function(err)
					{
						if(err) { console.log('Error saving period setup to the database', group.name); }
						callback(period);
					});
				});
			} else
			{
				callback(period);
			}
		});
	},
	
	/*	
	 *	Put available
	 *	input.periodid = _id of the period
	 *	input.date = date of availability
	 *	input.available = true / false
	 */
	'put/available' : function(input,callback)
	{
		var conditions = {_id: input.periodid};
		var update = {days:{}};
		if(input.available)
		{
			update.days[input.date] = { $addToSet: { available: this.passport.user.id }	};
		} else
		{
			update.days[input.date] = { $pull: { available: this.passport.user.id }	};
		}

		Period.update(conditions, update, function(err)
		{
			callback(err);
		});
	},

	/*
	 *	Create period
	 *	input.period = period data
	 */
	'create/period' : function(input,callback)
	{
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
	client.passport = client.request.session.passport;
	for(var key in apiFunctions)
	{
		client.on(key, apiFunctions[key]);
	}
});
