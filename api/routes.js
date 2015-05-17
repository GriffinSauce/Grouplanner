#!/bin/env node

var express = require('express');
var router = express.Router();

var Group = require(__dirname + '/../server/mongoose/group.js');
var User = require(__dirname + '/../server/mongoose/user.js');
var Period = require(__dirname + '/../server/mongoose/period.js');

// Authenticate user
router.use('/api/*', function(req, res, next)
{
    if(req.user === undefined)
	{
        console.log("USER NOT LOGGED IN");
		req.session.redirect_to = req.url;
		res.redirect('/login');
        // TODO: Instead of redirect respond with a 403 or 40? status.
	} else
	{
		next();
	}
});

router.get('/api/groups/', function(req, res)
{
	Group.find({'members':{$in:[req.user._id]}})
    .populate({path:'members', model:User})
    .populate({path:'events.user', model:User})
    .populate({path:'events.meta.period', model:Period})
    .populate({path:'events.meta.removeduser', model:User})
    .exec(function(err, groups)
	{
		res.json(groups);
	});
});

router.get('/api/groups/:group_id', function(req, res)
{
	Group.find({'members':{$in:[req.user._id]}, _id:req.params.group_id})
    .populate({path:'members', model:User})
    .populate({path:'events.user', model:User})
    .populate({path:'events.meta.period', model:Period})
    .populate({path:'events.meta.removeduser', model:User})
    .limit(1)
    .exec(function(err, groups)
	{
		res.json(groups[0]);
	});
});



module.exports = router;
