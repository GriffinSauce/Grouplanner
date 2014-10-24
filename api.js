#!/bin/env node

// Imports
var Group = require(__dirname + '/db/group.js');
var io = global.grouplanner.io;

// Object containing all functions
var apiFunctions = {

	/*	
	 *	Say hello
	 *
	 */
	hello : function(input,callback)
	{
		console.log('Client said hello, yay!');
		callback("Hello Client!");
	},

	/*	
	 *	Get group
	 *	input.group_id = group id
	 */
	getGroup : function(input,callback)
	{
		Group.findOne({_id: input.group_id}, function(err, group)
		{
			callback(group);
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
