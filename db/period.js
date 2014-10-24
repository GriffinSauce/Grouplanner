/*globals require, module */

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var periodSchema = new Schema(
{
	groupid: {type: Schema.Types.ObjectId},
	startdate: {type: Date},
	enddate: {type: Date},
	plannedDate: {type: Date},
	days:[
	{
		date: {type: Date},
		available: [],
		planned: {type:Boolean, default: false}
	}]
}, { autoIndex: false });

periodSchema.plugin(findOrCreate);

module.exports = mongoose.model('Period', periodSchema);
