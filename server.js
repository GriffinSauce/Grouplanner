#!/bin/env node

var globals		= require(__dirname + '/server/globals.js');
var exit		= require(__dirname + '/server/server-exit.js');
var database	= require(__dirname + '/server/database-connection.js');
var passport	= require(__dirname + '/server/routes/passport.js');
var fs			= require('fs');

var express					= require('express')();
var express_http			= require('http').Server(express);
var express_bodyParser		= require('body-parser');
var express_cookieParser	= require('cookie-parser');
var express_session			= require('express-session');
var express_methodOverride	= require('method-override');
var express_serveStatic		= require('serve-static');

var MongoStore = require('connect-mongo')(express_session);

var sessionMiddleware = express_session(
{
	secret: 'fg783#$%f',
	store: new MongoStore({
		mongoose_connection:global.grouplanner.mongoose.connections[0],
		db:global.grouplanner.database
	}),
	resave: true,
	saveUninitialized: true
});

// EXPRESS SETUP
express.set('title', 'Grouplanner');
express.use(express_cookieParser());
express.use(express_bodyParser.json());
express.use(express_methodOverride('X-HTTP-Method-Override'));
express.use(sessionMiddleware);

express.use(passport.passport.initialize());
express.use(passport.passport.session());
express.use(passport.router);

express.use("/", express_serveStatic(__dirname + '/app'));
express.all("*", function(req, res)
{
	console.log(req.originalUrl);
	fs.readFile(__dirname + '/app/index.html', 'utf8', function(err, text)
	{
        res.send(text);
    });
});

// START SERVER
express_http.listen(global.grouplanner.port, global.grouplanner.ipaddress, function()
{
	console.log('%s: Grouplanner started on %s:%d ...', Date(Date.now() ), global.grouplanner.ipaddress, global.grouplanner.port);
});
