#!/bin/env node

var globals = require(__dirname + '/server/globals.js');
var exit = require(__dirname + '/server/server-exit.js');
var database = require(__dirname + '/server/database-connection.js');

var express = require('express')();
var express_http = require('http').Server(express);
var express_bodyParser = require('body-parser');
var express_cookieParser = require('cookie-parser');
var express_session = require('express-session');
var express_methodOverride = require('method-override');
var express_serveStatic = require('serve-static');
var mongo_connect = require('connect-mongo')(express_session);

express.use("/", express_serveStatic(__dirname + '/app'));

// START SERVER
express_http.listen(global.grouplanner.port, global.grouplanner.ipaddress, function()
{
	console.log('%s: Grouplanner started on %s:%d ...', Date(Date.now() ), global.grouplanner.ipaddress, global.grouplanner.port);
});
