#!/bin/env node

var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var Group = require(__dirname + '/../db/group.js');

router.get('/groups/', function(req, res)
{
	Group.find({'members':{$in:[req.user._id]}}).populate('members').exec(function(err, groups)
	{
		res.jshare.user = req.user;
		res.jshare.groups = groups;
		res.render('groups', {page:'groups', user:req.user, groups:groups});
	});
});

module.exports.router = router;
