#!/bin/env node

var express = require('express');
var router = express.Router();
var Group = require(__dirname + '/../db/group.js');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var User = require(__dirname + '/../db/user.js');

// Passport routes
router.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/userinfo.email'}));
router.get('/oauth2callback', passport.authenticate('google', { successRedirect:'loginSuccess', failureRedirect: '/login' }));
router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
router.get('/auth/callback/facebook', passport.authenticate('facebook', { successRedirect:'loginSuccess', failureRedirect: '/login' }));
router.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));
router.get('/oauth2callback-twitter', passport.authenticate('twitter', { successRedirect:'loginSuccess', failureRedirect: '/login' }));

router.get('/login', function(req, res) { res.render('login', {page:'login'}); });
router.get('/loginSuccess', function(req, res)
{
	// If user came from invite link, we'll add him to the group and remove the invite token
	if(req.session.invitetoken)
	{
		Group.findOne({'invites.token': req.session.invitetoken}).exec(function(err, group)
		{
			group.update({$pull:{'invites':{'token':req.session.invitetoken}}, $push:{'members':req.user}}, function(err, group) {
				delete req.session.invitetoken;
			});
		});
	}

	var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
	delete req.session.redirect_to;
	res.redirect(redirect_to);
});

router.get('/logout', function(req, res)
{
	req.logout();
	req.session.destroy();
	res.redirect('/');
});


var googleStrategySettings = {};
var facebookStrategySettings = {};
var twitterStrategySettings = {};

if(global.grouplanner.environment == 'local')
{
	var SecretSettingsFile = require(__dirname + '/../secrets.json');

	googleStrategySettings.client_id = SecretSettingsFile.google.client_id;
	googleStrategySettings.client_secret = SecretSettingsFile.google.client_secret;
	googleStrategySettings.callbackURL = 'http://' + global.grouplanner.ipaddress + ':' + global.grouplanner.port + '/oauth2callback';

	facebookStrategySettings.client_id = SecretSettingsFile.facebook.app_id;
	facebookStrategySettings.client_secret = SecretSettingsFile.facebook.app_secret;
	facebookStrategySettings.callbackURL = 'http://' + global.grouplanner.ipaddress + ':' + global.grouplanner.port + '/oauth2callback-facebook';

	twitterStrategySettings.client_id = SecretSettingsFile.twitter.api_key;
	twitterStrategySettings.client_secret = SecretSettingsFile.twitter.api_secret;
	twitterStrategySettings.callbackURL = 'http://' + global.grouplanner.ipaddress + ':' + global.grouplanner.port + '/oauth2callback-twitter';
} else
{
	googleStrategySettings.client_id = process.env.GOOGLE_CLIENT_ID;
	googleStrategySettings.client_secret = process.env.GOOGLE_CLIENT_SECRET;
	googleStrategySettings.callbackURL = 'http://www.grouplanner.nl/oauth2callback';

	facebookStrategySettings.client_id = process.env.FACEBOOK_APP_ID;
	facebookStrategySettings.client_secret = process.env.FACEBOOK_APP_SECRET;
	facebookStrategySettings.callbackURL = 'http://www.grouplanner.nl/oauth2callback-facebook';

	twitterStrategySettings.client_id = process.env.TWITTER_API_KEY;
	twitterStrategySettings.client_secret = process.env.TWITTER_API_SECRET;
	twitterStrategySettings.callbackURL = 'http://www.grouplanner.nl/oauth2callback-twitter';
}

/**
* GOOGLE STRATEGY
**/
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
			auth:
			{
				provider: 'google',
				id: profile.id
			}
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
		}, function ()
		{
			process.nextTick(function()
			{
				return done(null, profile);
			});
		});
	}
));

/**
* FACEBOOK STRATEGY
**/

passport.use(new FacebookStrategy(
	{
		clientID: facebookStrategySettings.client_id,
		clientSecret: facebookStrategySettings.client_secret,
		callbackURL: facebookStrategySettings.callbackURL
	},
	function(accessToken, refreshToken, profile, done)
	{
		console.log("Facebook login success");
		console.log(profile);

		User.findOrCreate(
		{
			auth:
			{
				provider: 'facebook',
				id: profile.id
			}
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
			picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large'
		}, function ()
		{
			process.nextTick(function()
			{
				return done(null, profile);
			});
		});
	}
));

/**
* TWITTER STRATEGY
**/
console.log(twitterStrategySettings);
passport.use(new TwitterStrategy(
	{
		consumerKey: twitterStrategySettings.client_id,
		consumerSecret: twitterStrategySettings.client_secret,
		callbackURL: twitterStrategySettings.callbackURL
	},
	function(accessToken, refreshToken, profile, done)
	{
		console.log("Twitter login success");
		console.log(profile);

		User.findOrCreate(
		{
			auth:
			{
				provider: 'twitter',
				id: profile.id
			}
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
			picture: profile.photos[0].value
		}, function ()
		{
			process.nextTick(function()
			{
				return done(null, profile);
			});
		});
	}
));

passport.serializeUser(function(user, done)
{
	User.findOne({'auth.provider': user.provider, 'auth.id': user.id.toString()}, function(err, dbUser)
	{
		if(err) { console.warn(err); }
		done(null, dbUser);
	});
});

passport.deserializeUser(function(obj, done) {
	User.findOne({_id:obj._id}, function (err, user) {
		done(err, user);
	});
});

module.exports.router = router;
module.exports.passport = passport;
