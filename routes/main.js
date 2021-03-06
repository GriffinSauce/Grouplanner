#!/bin/env node

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	if(req.user === undefined)
	{
		req.session.redirect_to = req.url;
		res.render('index', {page:'index'});
	} else
	{
		res.redirect('/groups');
	}

});

router.get('/help', function(req, res) {
	res.render('help', {page:'help'});
});

module.exports.router = router;
