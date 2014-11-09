#!/bin/env node

var express = require('express');
var router = express.Router();

var Group = require(__dirname + '/../db/group.js');

// TODO: Use actual invite token
// TODO: Redirect to error if token invalid
router.get('/invite/:groupid', function(req, res)
{
	Group.findOne({_id: req.params.groupid}).populate('members').exec(function(err, group)
	{
		res.jshare.group = group;
		res.render('invite', {page:'invite', group:group});
	});
});

module.exports.router = router;
