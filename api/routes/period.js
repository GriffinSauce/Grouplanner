#!/bin/env node

var express = require('express');
var router = express.Router();
var moment = require('moment');

var Group = require(__dirname + '/../../server/mongoose/group.js');
var User = require(__dirname + '/../../server/mongoose/user.js');
var Period = require(__dirname + '/../../server/mongoose/period.js');

/**
* Gets a period for a group for a specific date
* @url /api/group/:group_id/period/:start_date
* @return {JSON} Period requested
**/
router.get('/group/:group_id/period/:start_date', function(req, res)
{
  Period.findOrCreate(
    {
      groupid: req.params.group_id,
      startDate: req.params.start_date
    },{ },
    function(err, period, created)
    {
      if(created)
      {
        Group.findOne({_id: req.params.group_id}, function(err, group)
        {
          var days = {};
          var datum = moment(req.params.start_date, 'YYYYMMDD');
          for(var i = 0; i < group.periodLength; i++)
          {
            if(i > 0){ datum.add(1, 'days'); }
            days[datum.format('YYYYMMDD')] = {
              available:[],
              planned:false
            };
          }
          period.endDate = datum.format('YYYYMMDD');
          period.days = days;
          period.save(function(err)
          {
            if(err) { console.log('Error saving period setup to the database', group.name); }
            res.json(period);
          });
        });
      } else
      {
        res.json(period);
      }
    });
});

/**
*
**/
router.put('/group/:group_id/period/:period_id/:date/available', function(req, res)
{
  Period.findOne({'_id': req.params.period_id}).exec(function(err, period)
  {
    if(period.days[req.params.date].available.indexOf(req.user._id) === -1)
    {
      period.days[req.params.date].available.push(req.user._id);
    }
    period.save(function(err)
    {
      if(err) { console.log('Error saving period setup to the database', group.name); }
      res.json(period.days);
    })
  });
});

module.exports = router;
