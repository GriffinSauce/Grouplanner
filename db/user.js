/*globals require, module */

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var userSchema = new Schema(
{
	username: {type: String, default: ''},
	name:
	{
		first: {type: String, default: ''},
		last: {type: String, default: ''}
	},
	email: {type: String, default: ''},
	dates:
	{
		created: { type: Date, default: Date.now },
		loggedin: { type: Date, default: Date.now },
	},
	auth:
	{
		provider: {type: String},
		id: {type: String}
	},
	picture: {type: String},
	gender: {type: String},
	lastgroup: {type: Schema.Types.ObjectId},
	meta:
	{

	}
}, {
	autoIndex: false,
	toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

userSchema.virtual('name.full').get(function()
{
	return this.name.first + ' ' + this.name.last;
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
