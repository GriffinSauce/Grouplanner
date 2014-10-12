/*globals require, module */

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var groupSchema = new Schema(
{
	groupid: {type: Schema.Types.ObjectId},
	startdate: {type: Date},
	enddate: {type: Date},
	available:
	{
		// Date timestamp and members
	}
}, { autoIndex: false });

groupSchema.plugin(findOrCreate);

module.exports = mongoose.model('Group', groupSchema);
