#!/bin/env node

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) { res.render('index'); });
router.get('/help', function(req, res) { res.render('help'); });
router.get('/emailtest', function(req, res) { res.render('invite_html'); });

module.exports.router = router;
