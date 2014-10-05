#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var User = require(__dirname + '/db/user.js');
var mongoose = require('mongoose');

var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

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

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
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
		mongoose.connect('mongodb://' + process.env.OPENSHIFT_MONGODB_DB_HOST);
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
    self.initializeServer = function() {
        self.app = express();
		self.app.set('title', 'Grouplanner');
		self.app.use("/", express.static(__dirname + '/www'));
		self.app.use(express.bodyParser());
		self.app.use(express.session({secret: 'fg783#$%f'}));
  		self.app.use(passport.initialize());
  		self.app.use(passport.session());
		self.app.get('/auth/google', passport.authenticate('google'));
		self.app.get('/auth/google/return', passport.authenticate('google', {successRedirect: '/', failureRedirect: '/login.html'}));
		self.app.put('/user', self.addUser);
		self.app.get('/user/:userid', self.getUser);
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
		passport.use(new GoogleStrategy(
			{
				returnURL: 'http://www.example.com/auth/google/return',
				realm: 'http://localhost:8085/'
			},
			function(identifier, profile, done)
			{
				console.log(profile);
				User.findOrCreate({ openId: identifier }, function(err, user)
				{
					done(err, user);
				});
			}
		));
		passport.serializeUser(function(user, done) { done(null, user.id); });
		passport.deserializeUser(function(id, done) {
			User.findById(id, function(err, user) {
				done(err, user);
			});
		});
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

