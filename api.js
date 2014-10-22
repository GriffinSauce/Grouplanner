/*
 *
 *	api.js contains all events communication between client and server
 *
 */

// Imports
var Group = require(__dirname + '/db/group.js');
var io = global.io;

// Socket listeners
io.on('connection', function (client)
{
	console.log('Socket IO is listening');
	
	client.on('helloServer', hello);
	client.on('getGroup', getGroup);
});


/*	
 *	Get group
 *	input.group_id = group id
 *
 */
function hello(input,callback)
{
	console.log('Client said hello, yay!');
	callback("Hello Client!");
}


/*	
 *	Get group
 *	input.group_id = group id
 *
 */
function getGroup(input,callback)
{
	Group.findOne({_id: input.groupid}, function(err, group)
	{
		callback(group);
	});
}

// Export for use in server.js
module.exports = {
	hello:hello,
	getGroup:getGroup
};