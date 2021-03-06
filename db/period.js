/*globals require, module */

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var periodSchema = new Schema(
{
	groupid: {type: Schema.Types.ObjectId},
	startDate: {type: String},
	endDate: {type: String},
	plannedDate: {type: String, default: 'false'},
	days: {type: Object, default: {}},
	mailed: {type: Boolean, default: false},
}, { autoIndex: false });

periodSchema.plugin(findOrCreate);

module.exports = mongoose.model('Period', periodSchema);
