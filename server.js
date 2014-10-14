#!/bin/env node

setUpVariables();

var express = require('express');

// Express middleware
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var methodOverride = require('method-override');

var handlebars = require('express-handlebars');
var MongoStore = require('connect-mongo')(session);

var mongoose = require('mongoose');
var jshare = require('jshare');
var serveStatic = require('serve-static');

var routes =
{
	main: 		require(__dirname + '/routes/main.js'),
	passport: 	require(__dirname + '/routes/passport.js'),
	group: 		require(__dirname + '/routes/group.js')
};

function setUpVariables()
{
	//  Set the environment variables we need.
	global.grouplanner = {};
	global.grouplanner.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
	global.grouplanner.port      = process.env.OPENSHIFT_NODEJS_PORT || 8085;
	global.grouplanner.environment = 'remote';

	if (typeof global.grouplanner.ipaddress === "undefined")
	{
		//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
		//  allows us to run/test the app locally.
		console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
		global.grouplanner.ipaddress = "127.0.0.1";
		global.grouplanner.environment = 'local';
	}
}

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
		if(global.grouplanner.environment == 'local')
		{
			mongoose.connect('mongodb://' + (process.env.OPENSHIFT_MONGODB_DB_HOST || global.grouplanner.ipaddress) + '/grouplanner');
		} else
		{
			mongoose.connect('mongodb://' + process.env.MONGODB_USER + ':' + process.env.MONGODB_PASS + '@' + (process.env.OPENSHIFT_MONGODB_DB_HOST || global.grouplanner.ipaddress) + '/grouplanner');
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
		self.app.use(routes.passport.passport.initialize());
  		self.app.use(routes.passport.passport.session());

		// Add templating engine
		self.app.engine('handlebars', handlebars());
		self.app.set('view engine', 'handlebars');

		self.app.use("/www", serveStatic(__dirname + '/www'));
		self.app.use('/', routes.main.router);
		self.app.use('/', routes.passport.router);

		self.app.use(function(req, res, next)
		{
			console.log("CHECK USER LOGIN");
			if(req.user === undefined)
			{
				req.session.redirect_to = req.url;
				res.redirect('/login');
			} else
			{
				next();
			}
		});
		
		// AUTHENTICATED ROUTES
		self.app.use('/', routes.group.router);
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function()
	{
        self.setupTerminationHandlers();
		self.setupDatabaseConnection();
        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(global.grouplanner.port, global.grouplanner.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), global.grouplanner.ipaddress, global.grouplanner.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var grouplanner = new GrouplannerApp();
grouplanner.initialize();
grouplanner.start();

