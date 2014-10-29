#!/bin/env node

// Imports
var Period = require(__dirname + '/db/period.js');
var Group = require(__dirname + '/db/group.js');
var io = global.grouplanner.io;
var moment = require('moment');

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
		console.log('Getting group by ID: '+input.id);
		if(input.id !== undefined)
		{
			Group.findOne({_id: input.id}, function(err, group)
			{
				console.log('Group found');
				callback(group);
			});
		}else{
			// Find a random group this user is a member of
			Group.findOne({'members':{$in:[this.passport.user._id]}}, function(err, group)
			{
				console.log('Group not found, returning random');
				callback(group);
			});	
		}
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
	'get/period' : function(input, callback)
	{
		console.log('Getting period with params:');
		console.log(input);
		Period.findOrCreate(
		{
			groupid: input.groupid,
			startDate: input.startDate
		},
		{
			endDate: input.endDate
		},
		function(err, period, created)
		{
			if(created)
			{
				Group.findOne({_id: input.groupid}, function(err, group)
				{
					var days = {};
					for(var i = 0; i < group.periodLength; i++)
					{
						var datum = moment(input.startDate, 'DDMMYYYY');
						datum.add(i, 'days');
						days[datum.format('DDMMYYYY')] = {
							available:[],
							planned:false
						};
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
		console.log('Updating date '+input.date+' in period '+input.periodid);
		var conditions = {_id: input.periodid};
		var update = {};
		if(input.available)
		{
			update.$addToSet = {};
			update.$addToSet['days.'+input.date+'.available'] = this.passport.user._id;
			console.log(this.passport.user._id+' is available');
		} else
		{
			update.days.$pull = {};
			update.days.$pull['days.'+input.date+'.available'] = this.passport.user._id;
			console.log(this.passport.user._id+' is not available');
		}

		Period.update(conditions, update, function(err)
		{
			if(err) { console.log('Error updating'); console.log(err); }
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
