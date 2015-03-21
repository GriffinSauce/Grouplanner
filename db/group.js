/*globals require, module, Buffer */

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var groupSchema = new Schema(
{
	name: {type: String, default: ''},
	eventtype: {type: String, default: 'dates'},
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
	},
	permissions:
	{
		plan: {
			allowed: [{type:Schema.Types.ObjectId, ref: 'User'}],
			addNewMembers: {type:Boolean}
		},
		settings: {
			allowed: [{type:Schema.Types.ObjectId, ref: 'User'}],
			addNewMembers: {type:Boolean}
		}
	},
	events:
	[
		{
			type: {type:String, default:''},
			user: {type:Schema.Types.ObjectId, ref: 'User'},
			date: {type:Date, default:Date.now },
			meta: {type:Object, default: {}}
		}
	]
}, {
	autoIndex: false,
	toObject: {virtuals: true},
	toJSON: {virtuals: true}
});

groupSchema.virtual('description').get(function()
{
	return "We're called "+this.name+" and we plan "+this.eventtype+" once every "+this.periodLength+" days.";
});

groupSchema.plugin(findOrCreate);

module.exports = mongoose.model('Group', groupSchema);
