#!/bin/env node

var express = require('express');
var router = express.Router();
var moment = require('moment');

var Group = require(__dirname + '/../server/mongoose/group.js');
var User = require(__dirname + '/../server/mongoose/user.js');
var Period = require(__dirname + '/../server/mongoose/period.js');

router.get('/group', function(req, res)
{
	Group.find({'members':{$in:[req.user._id]}})
    .populate({path:'members', model:User})
    .populate({path:'events.user', model:User})
    .populate({path:'events.meta.period', model:Period})
    .populate({path:'events.meta.removeduser', model:User})
    .exec(function(err, groups)
	{
		res.json(groups);
	});
});

router.post('/group', function(req, res)
{
    var group = new Group(req.body);
    group.creator = req.user._id;
    group.members.push(req.user._id);
    group.events.push({ type:'group-created', user:req.user._id});
    group.save(function(err)
    {
        if(err) { console.log('Error saving group %s to the database', group.name); }
        else { console.log('Group %s saved to the database', group.name); }
        User.update({_id:group.creator}, {lastgroup:group._id}, function(err)
        {
            if(err) { console.log('Error updating'); console.log(err); }
            console.log('Saved to user as lastgroup');
        });
        res.status(201);
        res.json(group);
    });
});

router.get('/group/:group_id', function(req, res)
{
	Group.find({'members':{$in:[req.user._id]}, _id:req.params.group_id})
    .populate({path:'members', model:User})
    .populate({path:'events.user', model:User})
    .populate({path:'events.meta.period', model:Period})
    .populate({path:'events.meta.removeduser', model:User})
    .limit(1)
    .exec(function(err, groups)
	{
		res.json(groups[0]);
	});
});

/**
* Gets a period for a group for a specific date
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

module.exports = router;