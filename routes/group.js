#!/bin/env node

var express = require('express');
var router = express.Router();

var Group = require(__dirname + '/../db/group.js');

router.get('/create', function(req, res)
{
	res.jshare.user = req.user;
	res.render('create', {page:'create', user: req.user});
});

router.get('/group/', function(req, res)
{
	if(req.user.lastgroup !== undefined)
	{
		res.redirect('/group/'+req.user.lastgroup);
	}else{
		res.redirect('/groups/');
	}
});

router.get('/group/:groupid', function(req, res)
{
	Group.findOne({_id: req.params.groupid}).populate('members').populate('events.user').exec(function(err, group)
	{
		res.jshare.user = req.user;
		res.jshare.group = group;
		res.render('group', {page:'group', user:req.user, group:group});
	});
});

module.exports.router = router;
