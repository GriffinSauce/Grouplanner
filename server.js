#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var handlebars = require('express-handlebars');
var mongoose = require('mongoose');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require(__dirname + '/db/user.js');
var Group = require(__dirname + '/db/group.js');

/**
 *  Define the sample application.
 */
var GrouplannerApp = function() {

    //  Scope.
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8085;
		self.environment = 'remote';

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
			self.environment = 'local';
        }
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element) {
            process.on(element, function() { self.terminator(element); });
        });
    };

	self.setupDatabaseConnection = function()
	{
		if(self.environment == 'local')
		{
			mongoose.connect('mongodb://' + (process.env.OPENSHIFT_MONGODB_DB_HOST || self.ipaddress) + '/grouplanner');
		} else
		{
			mongoose.connect('mongodb://' + process.env.MONGODB_USER + ':' + process.env.MONGODB_PASS + '@' + (process.env.OPENSHIFT_MONGODB_DB_HOST || self.ipaddress) + '/grouplanner');
		}
		var db = mongoose.connection;
		db.once('open', function callback () {
		  console.log('Connected to the database');
		});
	};


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function()
	{
		// Express init
        self.app = express();
		self.app.set('title', 'Grouplanner');
		self.app.use(express.cookieParser());
		self.app.use(express.bodyParser());
		self.app.use(express.methodOverride());
		self.app.use(express.session({secret: 'fg783#$%f'}));

		// Passport init
		self.app.use(passport.initialize());
  		self.app.use(passport.session());

		// Add templating engine
		self.app.engine('handlebars', handlebars());
		self.app.set('view engine', 'handlebars');

		// Passport routes
		self.app.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/userinfo.email'}));
		self.app.get('/oauth2callback', passport.authenticate('google', { failureRedirect: '/login' }),
		function(req, res)
		{
			// Successful authentication, redirect to requested page
			var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
			delete req.session.redirect_to;
			res.redirect(redirect_to);
		});

		// User test routes
		self.app.put('/user', self.addUser);
		self.app.get('/user/:userid', self.getUser);

		self.app.put('/group', self.addGroup);
		self.app.get('/group/:groupid', self.getGroup);

		// Set routes
		self.app.get('/', function(req, res) { res.render('index'); });
		self.app.get('/login', function(req, res) { res.render('login'); });
		self.app.get('/help', function(req, res) { res.render('help'); });
		self.app.get('/create', function(req, res) 
		{
			if(req.user === undefined)
			{
				req.session.redirect_to = '/create';
				res.redirect('/login');
			} else
			{
				res.render('create', {user: req.user});
			}
		});
		self.app.get('/planner', function(req, res)
		{
			if(req.user === undefined)
			{
				req.session.redirect_to = '/planner';
				res.redirect('/login');
			} else
			{
				res.render('planner', {user: req.user});
			}
		});

		self.app.use("/", express.static(__dirname + '/www'));

    };

	self.addGroup = function(req, res)
	{
		if(req.user === undefined)
		{
			res.json({success: false, message:'User should login before creating a group'});
		} else
		{
			var group = new Group(req.body);
			group.creator = req.user._id;
			group.members.push(req.user._id);
			require('crypto').randomBytes(48, function(ex, buf)
			{
				group.token = buf.toString('hex');
				group.save(function(err)
				{
					if(err) { console.log('Error saving group %s to the database', group.name); }
					else { console.log('Group %s saved to the database', group.name); }
					res.json({success:true, id:group._id, message: 'saved as: ' + group._id + '\n'});
				});
			});
		}
	};
	
	self.getGroup = function(req, res)
	{
		Group.findOne({_id: req.params.groupid}, function(err, group)
		{
			res.send(JSON.stringify(group));
		});
	};

	self.addUser = function(req, res)
	{
		var user = new User(req.body);
		user.save(function(err)
		{
			if(err) { console.log('Error saving user %s %s to the database', user.name.first, user.name.last); }
			else { console.log('User %s %s saved to the database', user.name.first, user.name.last); }
			res.send('saved as: ' + user._id + '\n');
		});
	};

	self.getUser = function(req, res)
	{
		User.findOne({_id: req.params.userid}, function(err, user)
		{
			res.send(JSON.stringify(user));
		});
	};

	self.setupAuthentication = function()
	{
		var googleStrategySettings = {};

		if(self.environment == 'local')
		{
			var googleStrategySettingsFile = require(__dirname + '/google-secret.json');
			googleStrategySettings.client_id = googleStrategySettingsFile.web.client_id;
			googleStrategySettings.client_secret = googleStrategySettingsFile.web.client_secret;
			googleStrategySettings.callbackURL = 'http://' + self.ipaddress + ':' + self.port + '/oauth2callback';
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
						googleId: profile.id,
						email: profile.emails[0].value,
						username: profile.displayName,
						name:
						{
							first: profile.name.givenName,
							last: profile.name.familyName
						},
						gender: profile._json.gender,
						picture: profile._json.picture
					}, function (err, user)
				{
					return done(err, user);
				});
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
		passport.deserializeUser(function(obj, done) { done(null, obj); });
	}

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();
		self.setupDatabaseConnection();
		self.setupAuthentication();
        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var grouplanner = new GrouplannerApp();
grouplanner.initialize();
grouplanner.start();

