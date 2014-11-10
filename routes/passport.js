#!/bin/env node

var express = require('express');
var router = express.Router();

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require(__dirname + '/../db/user.js');

// Passport routes
router.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/userinfo.email'}));
router.get('/oauth2callback', passport.authenticate('google', { successRedirect:'loginSuccess', failureRedirect: '/login' }));

router.get('/login', function(req, res) { res.render('login', {page:'login'}); });
router.get('/loginSuccess', function(req, res)
{
	var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
	delete req.session.redirect_to;
	res.redirect(redirect_to);
});

router.get('/logout', function(req, res)
{
	req.logout();
	res.redirect('/');
});


var googleStrategySettings = {};

if(global.grouplanner.environment == 'local')
{
	var googleStrategySettingsFile = require(__dirname + '/../google-secret.json');
	googleStrategySettings.client_id = googleStrategySettingsFile.web.client_id;
	googleStrategySettings.client_secret = googleStrategySettingsFile.web.client_secret;
	googleStrategySettings.callbackURL = 'http://' + global.grouplanner.ipaddress + ':' + global.grouplanner.port + '/oauth2callback';
} else
{
	googleStrategySettings.client_id = process.env.GOOGLE_CLIENT_ID;
	googleStrategySettings.client_secret = process.env.GOOGLE_CLIENT_SECRET;
	googleStrategySettings.callbackURL = 'http://www.grouplanner.nl/oauth2callback';
}

passport.use(new GoogleStrategy
(
	{
		clientID: googleStrategySettings.client_id,
		clientSecret: googleStrategySettings.client_secret,
		callbackURL: googleStrategySettings.callbackURL
	},
	function(accessToken, refreshToken, profile, done)
	{
		User.findOrCreate(
			{
				googleId: profile.id
			},
			{
				email: profile.emails[0].value,
				username: profile.displayName,
				name:
				{
					first: profile.name.givenName,
					last: profile.name.familyName
				},
				gender: profile._json.gender,
				picture: profile._json.picture
			}, function (){});
		process.nextTick(function()
		{
			return done(null, profile);
		});
	}
));

passport.serializeUser(function(user, done)
{
	var grouplannerUser = {};
	switch(user.provider)
	{
		case 'google':
			User.findOne({googleId: user.id}, function(err, dbUser)
			{
				if(err) { console.warn(err); grouplannerUser = user; }
				else { grouplannerUser = dbUser; }
				done(null, grouplannerUser);
			});
			break;
		default:
			grouplannerUser = user;
			done(null, grouplannerUser);
			break;
	}
});

passport.deserializeUser(function(obj, done) {
	User.findOne(obj._id, function (err, user) {
		done(err, user);
	});
});

module.exports.router = router;
module.exports.passport = passport;
