#!/bin/env node

var express = require('express');
var router = express.Router();
var moment = require('moment');

var Group = require(__dirname + '/../server/mongoose/group.js');
var User = require(__dirname + '/../server/mongoose/user.js');
var Period = require(__dirname + '/../server/mongoose/period.js');

var groupRoutes = require(__dirname + '/routes/group.js');

// Authenticate user
router.use('/*', function(req, res, next)
{
    if(req.user === undefined)
	{
        res.sendStatus(401);
	} else
	{
		next();
	}
});

router.use(groupRoutes);

module.exports = router;
