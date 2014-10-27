/*globals require, module */

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var periodSchema = new Schema(
{
	groupid: {type: Schema.Types.ObjectId},
	startDate: {type: Date},
	endDate: {type: Date},
	plannedDate: {type: Date},
	days: {type: Object, default: {}},
}, { autoIndex: false });

periodSchema.plugin(findOrCreate);

module.exports = mongoose.model('Period', periodSchema);
