#!/bin/env node

var express = require('express');
var router = express.Router();

// Authenticate user
router.use('/api/*', function(req, res, next)
{
    if(req.user === undefined)
	{
		req.session.redirect_to = req.url;
		res.redirect('/login');
	} else
	{
		next();
	}
});



module.exports = router;
