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
