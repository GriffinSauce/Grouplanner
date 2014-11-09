/*globals require, module, Buffer */

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var groupSchema = new Schema(
{
	name: {type: String, default: ''},
	eventtype: {type: String, default: 'dates'},
	description: {type: String, default: ''},
	image: {data: Buffer, contentType: String},
	startdate: {type: Date},
	periodLength: {type: Number, default: 7},
	members: [
		{type: Schema.Types.ObjectId, ref: 'User'}
	],
	creator: {type: Schema.Types.ObjectId},
	invites:
	{
		token: {type: String},
		open: {type: Boolean},
		email: {type: String}
	}
}, { autoIndex: false });

groupSchema.plugin(findOrCreate);

module.exports = mongoose.model('Group', groupSchema);
