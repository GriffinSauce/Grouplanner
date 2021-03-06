#!/bin/env node

// Imports
var Period = require(__dirname + '/db/period.js');
var Group = require(__dirname + '/db/group.js');
var User = require(__dirname + '/db/user.js');
var io = global.grouplanner.io;
var moment = require('moment');
var email = require(__dirname + '/email.js');
var mongoose = require('mongoose');

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
			Group.findOne({_id: input.id}).populate('members').populate('events.user').exec(function(err, group)
			{
				console.log('Group found');
				callback(group);
			});
		}else{
			// Find a random group this user is a member of
			Group.findOne({_id: this.passport.user.lastgroup}).populate('members').populate('events.user').exec(function(err, group)
			{
				console.log('Group not found, returning lastgroup');
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
        group.events.push({ type:'group-created', user:this.passport.user._id});
		group.save(function(err)
		{
			if(err) { console.log('Error saving group %s to the database', group.name); }
			else { console.log('Group %s saved to the database', group.name); }
			callback({success:true, id:group._id, message: 'saved as: ' + group._id + '\n'});

			User.update({_id:group.creator}, {lastgroup:group._id}, function(err)
			{
				if(err) { console.log('Error updating'); console.log(err); }
				console.log('Saved to user as lastgroup');
			});
		});
	},

	/*
	 *	Update group
	 *	input.group = group data
	 */
	'update/group' : function(input, callback)
	{
		var update = {};
		if(input.group.name !== undefined){			update.name = input.group.name;	}
		if(input.group.periodLength !== undefined){	update.periodLength = input.group.periodLength;	}
		if(input.group.eventtype !== undefined){	update.eventtype = input.group.eventtype;	}
		if(input.group.permissions !== undefined){	update.permissions = input.group.permissions;	}
        update.$push = {'events':{ type:'group-updated', user:this.passport.user._id, meta: { updated:input.group }}};

		console.log('Updating group '+input.group.id+' with:');
		console.log(update);

		Group.findOneAndUpdate({_id:input.group.id}, update, function(err,group)
		{
			if(err) { console.log('Error updating'); console.log(err); }else{
				console.log('Updated group');
				callback({success:true,group:group});
			}
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
			update.$pull = {};
			update.$pull['days.'+input.date+'.available'] = this.passport.user._id;
			console.log(this.passport.user._id+' is not available');
		}

		Period.update(conditions, update, function(err)
		{
			if(err) { console.log('Error updating'); console.log(err); }
			callback({success:true});
		});
	},

	/*
	 *	Put planned
	 *	input.periodid = _id of the period
	 *	input.date = date that is planned
	 *	input.planned = true / false
	 */
	'put/planned' : function(input,callback)
	{
		var scope = this;
		console.log('Updating date '+input.date+' in period '+input.periodid);
		var update = {};
		update['days.'+input.date+'.planned'] = input.planned;
		update.plannedDate = input.planned ? input.date : false;
		if(input.mailed !== undefined)
		{
			update.mailed = input.mailed;
		}
		Period.findOneAndUpdate({_id: input.periodid}, update, function(err, period)
		{
			if(err) { console.log('Error updating'); console.log(err); }
            Group.update(
                {_id: period.groupid},
                {
                    $push:
                    {
                        'events':
                        {
                            type:'period-planned',
                            user: scope.passport.user._id,
                            meta:
                            {
                                period: mongoose.Types.ObjectId(this._id)
                            }
                        }
                    }
                }, function(err)
                {
                     if(err) { console.log('Error adding event'); console.log(err); }
                     callback({success:true});
                });
		});
	},

	/*
	 *	Put user, users can only update their own data
	 *	input.lastgroup = _id of group
	 */
	'put/user' : function(input,callback)
	{
		console.log('Updating user '+this.passport.user._id);
		var update = {
			lastgroup:input.lastgroup
		};
		User.update({_id:this.passport.user._id}, update, function(err)
		{
			if(err) { console.log('Error updating'); console.log(err); }
			callback({success:true});
		});
	},

	/*
	 *	Delete user from group
	 *	input.group = _id of group
	 *	input.member = _id of user
	 */
	'delete/group/member' : function(input, callback)
	{
		var scope = this;
		var kamikaze = true;
		if(this.passport.user._id !== input.member)
		{
			// The user is removing someone else from the group, does he have the power?
			kamikaze = false;
		}
		Group.findOne({_id: input.group}).populate('members').exec(function(err, group)
		{
			if(err) { console.log("Error: " + err);	}
			else
			{
                group.members.pull(input.member);
                group.events.push({
					type: 'user-removed',
					user: scope.passport.user._id,
					meta:
					{
						removeduser: mongoose.Types.ObjectId(input.member),
						selfremove: kamikaze
					}
				});
				group.save(function()
				{
					callback(input.member);
				});
			}
		});
	},

	/*
	 *	Put invite, sends an invite and saves token to db
	 *	input.group = _id of group
	 *	input.invitedUser = ..seriously?
	 */
	'put/invite' : function(input, callback)
	{
		// TODO: Save token to db and pass to e-mail
		var scope = this;
		require('crypto').randomBytes(48, function(ex, buf)
		{
			var token = buf.toString('hex');
			var update = {};
			input.invitedUser.token = token;
			update.$addToSet = {
				invites:{
					token:token,
					open:true,
					email:input.invitedUser.email
				},
				events:{
					type: 'user-invited',
					user: scope.passport.user._id,
					meta:
					{
						inviteduser: input.invitedUser.email
					}
				}
			};
			Group.findOneAndUpdate({_id: input.group}, update, function(err, group)
			{
				if(err) { console.log('Error creating invite');
				}else{
					email.sendInvite(scope.passport.user, group, input.invitedUser);
					callback({success:true});
				}
			});
		});
	},

	/*
	 *	Put notification, sends an email notification
	 *	input.group = _id of group
	 */
	'put/notification' : function(input, callback)
	{
		Group.findOne({_id: input.group}).populate('members').exec(function(err, group)
		{
			if(err) { console.log('Error finding group');
			}else{
				var to = '';
				var from = {};
				console.log(input.from);
				// Find group
				for(var i=0; i<group.members.length; i++)
				{
					group.members[i].id = String(group.members[i]._id); // Fuck you, Mongo, just .. fuck you.
					if(input.to.indexOf(group.members[i].id) !== -1)
					{
						to += group.members[i].email+', ';
					}
					if(group.members[i].id === input.from)
					{
						from = group.members[i];
					}
				}
				// Email
				email.sendNotification(input.type, to, from, group, input.data);
				// Save
				if(input.type == 'plannedDate')
				{
					console.log('date: '+input.data.date);
					Period.update({plannedDate: input.data.date}, {mailed:true}, function(err)
					{
						if(err) { console.log('Error saving mailed status');}
					});
				}
				callback({success:true});
			}
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
