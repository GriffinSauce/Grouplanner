var mongoose = require('mongoose');
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
	meta:
	{

	}
}, { autoIndex: false });

userSchema.virtual('name.full').get(function()
{
	return this.name.first + ' ' + this.name.last;
});

module.exports = mongoose.model('User', userSchema);
