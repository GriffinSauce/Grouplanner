#!/bin/env node

var express = require('express');
var router = express.Router();

var Group = require(__dirname + '/../server/mongoose/group.js');
var User = require(__dirname + '/../server/mongoose/user.js');
var Period = require(__dirname + '/../server/mongoose/period.js');

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

router.get('/groups', function(req, res)
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

router.post('/groups', function(req, res)
{
    var group = new Group(req.body.group);
    group.creator = req.user._id;
    group.members.push(req.user._id);
    group.events.push({ type:'group-created', user:req.user._id});
    group.save(function(err)
    {
        if(err) { console.log('Error saving group %s to the database', group.name); }
        else { console.log('Group %s saved to the database', group.name); }
        User.update({_id:group.creator}, {lastgroup:group._id}, function(err)
        {
            if(err) { console.log('Error updating'); console.log(err); }
            console.log('Saved to user as lastgroup');
        });
        res.sendStatus(201);
        res.json(group);
    });
});

router.get('/groups/:group_id', function(req, res)
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
