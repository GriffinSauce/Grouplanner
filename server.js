#!/bin/env node

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

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
global.grouplanner.io = io;

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
	group: 		require(__dirname + '/routes/group.js'),
	groups: 	require(__dirname + '/routes/groups.js'),
	invite: 	require(__dirname + '/routes/invite.js')
};

// DATABASE CONNECTION
if(global.grouplanner.environment == 'local')
{
	mongoose.connect('mongodb://' + (process.env.OPENSHIFT_MONGODB_DB_HOST || global.grouplanner.ipaddress) + '/grouplanner');
} else
{
	var dbname = process.env.MONGODB_DB || 'grouplanner';
	mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL + dbname);
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() { console.log('Connected to the database'); });


var sessionMiddleware = session(
{
	secret: 'fg783#$%f',
	store: new MongoStore({
		mongoose_connection:mongoose.connections[0],
		db:mongoose.connection.db
	}),
	resave: true,
    saveUninitialized: true
});

// EXPRESS SETUP
app.set('title', 'Grouplanner');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(sessionMiddleware);

global.grouplanner.io.use(function(socket, next)
{
	sessionMiddleware(socket.request, {}, next);
});

// Api
var api = require(__dirname + '/api.js');

// Add JShare
app.use(jshare());

// Passport init
app.use(routes.passport.passport.initialize());
app.use(routes.passport.passport.session());

// Add templating engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

app.use("/www", serveStatic(__dirname + '/www'));
app.use('/', routes.main.router);
app.use('/', routes.invite.router);
app.use('/', routes.passport.router);

app.use(function(req, res, next)
{
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
app.use('/', routes.groups.router);
app.use('/', routes.group.router);

// START SERVER
http.listen(global.grouplanner.port, global.grouplanner.ipaddress, function()
{
	console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), global.grouplanner.ipaddress, global.grouplanner.port);
});

/**
 *  terminator === the termination handler
 *  Terminate server on receipt of the specified signal.
 *  @param {string} sig  Signal to terminate on.
 */
function terminator(sig)
{
	if (typeof sig === "string")
	{
	   console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
	   process.exit(1);
	}
	console.log('%s: Node server stopped.', Date(Date.now()) );
}

// Process on exit and signals.
process.on('exit', function(){ terminator(); });

// Removed 'SIGPIPE' from the list - bugz 852598.
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function(element)
{
	process.on(element, function() { terminator(element); });
});
