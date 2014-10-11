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
	length: {type: Number, defaul: 7},
	members: {type: Array, defaul: []},
	creator: {type: Schema.Types.ObjectId},
	invites:
	{
		token: {type: String},
		open: {type: Number}
	}
}, { autoIndex: false });

groupSchema.plugin(findOrCreate);

module.exports = mongoose.model('Group', groupSchema);
