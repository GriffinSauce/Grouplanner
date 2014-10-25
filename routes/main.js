#!/bin/env node

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) { res.render('index'); });
router.get('/help', function(req, res) { res.render('help'); });

module.exports.router = router;
