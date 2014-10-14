#!/bin/env node

var express = require('express');
var router = express.Router();
var serveStatic = require('serve-static');

router.get('/', function(req, res) { res.render('index'); });
router.get('/help', function(req, res) { res.render('help'); });
router.use("/", serveStatic(__dirname + '/www'));

module.exports.router = router;
