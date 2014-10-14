#!/bin/env node

var express = require('express');
var router = express.Router();

var Group = require(__dirname + '/../db/group.js');

router.put('/group', addGroup);
router.get('/group/:groupid', getGroup);
router.get('/create', function(req, res)
{
	res.jshare.user = req.user;
	res.render('create', {user: req.user});
});

router.get('/planner', function(req, res)
{
	res.jshare.user = req.user;
	res.render('planner', {user: req.user});
});

function addGroup(req, res)
{
	if(req.user === undefined)
	{
		res.json({success: false, message:'User should login before creating a group'});
	} else
	{
		var group = new Group(req.body);
		group.creator = req.user._id;
		group.members.push(req.user._id);
		require('crypto').randomBytes(48, function(ex, buf)
		{
			group.token = buf.toString('hex');
			group.save(function(err)
			{
				if(err) { console.log('Error saving group %s to the database', group.name); }
				else { console.log('Group %s saved to the database', group.name); }
				res.json({success:true, id:group._id, message: 'saved as: ' + group._id + '\n'});
			});
		});
	}
}

function getGroup(req, res)
{
	Group.findOne({_id: req.params.groupid}, function(err, group)
	{
		res.send(JSON.stringify(group));
	});
}

module.exports.router = router;
