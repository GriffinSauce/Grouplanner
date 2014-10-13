#!/bin/env node
//  OpenShift sample Node application
var express = require('express');

// Express middleware
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var serveStatic = require('serve-static');

var handlebars = require('express-handlebars');
var MongoStore = require('connect-mongo')(session);

var mongoose = require('mongoose');
var jshare = require('jshare');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require(__dirname + '/db/user.js');

var routes =
{
	group: require(__dirname + '/routes/group.js')
};

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
		self.app.use(cookieParser());
		self.app.use(bodyParser.json());
		self.app.use(methodOverride('X-HTTP-Method-Override'));
		self.app.use(session({
			secret: 'fg783#$%f',
			store: new MongoStore({
				mongoose_connection:mongoose.connections[0],
				db:mongoose.connection.db
			})
		}));

		// Add JShare
		self.app.use(jshare());
		
		// Passport init
		self.app.use(passport.initialize());
  		self.app.use(passport.session());

		// Add templating engine
		self.app.engine('handlebars', handlebars());
		self.app.set('view engine', 'handlebars');

		// Passport routes
		self.app.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/userinfo.email'}));
		self.app.get('/oauth2callback', passport.authenticate('google', { successRedirect:'loginSuccess', failureRedirect: '/login' }));

		self.app.use('/', routes.group);
		// Set routes
		self.app.get('/', function(req, res) { res.render('index'); });
		self.app.get('/login', function(req, res)
		{
			if(req.user === undefined)
			{
				res.render('login');
			}else{
				// User is already logged in
 				res.redirect('/');
			}
		});
		self.app.get('/loginSuccess', function(req, res)
		{
			var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
			delete req.session.redirect_to;
			res.redirect(redirect_to);
		});
		self.app.get('/logout', function(req, res)
		{
			req.logout();
 			res.redirect('/');
		});
		self.app.get('/help', function(req, res) { res.render('help'); });
		self.app.get('/create', function(req, res) 
		{
			if(req.user === undefined)
			{
				req.session.redirect_to = '/create';
				res.redirect('/login');
			} else
			{
				res.jshare.user = req.user;
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
				res.jshare.user = req.user;
				res.render('planner', {user: req.user});
			}
		});

		self.app.use("/", serveStatic(__dirname + '/www'));

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

