#!/bin/env node

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');
var handlebars = require('handlebars');
var mailAuth = {
	invite:{},
	groups:{},
	support:{}
};

var templates =
{
	invite:
	{
		text: __dirname + '/emailtemplates/invite_text.handlebars',
		html: __dirname + '/emailtemplates/invite_html.handlebars'
	},
	notification_plannedDate:
	{
		text: __dirname + '/emailtemplates/notification_plannedDate_text.handlebars',
		html: __dirname + '/emailtemplates/notification_plannedDate_html.handlebars'
	}
};

if(global.grouplanner.environment == 'local')
{
	var settingsJson = require(__dirname + '/google-secret.json');
	mailAuth.invite.user = settingsJson.mail.invite.username;
	mailAuth.invite.pass = settingsJson.mail.invite.password;
	mailAuth.groups.user = settingsJson.mail.groups.username;
	mailAuth.groups.pass = settingsJson.mail.groups.password;
	mailAuth.support.user = settingsJson.mail.support.username;
	mailAuth.support.pass = settingsJson.mail.support.password;
} else
{
	mailAuth.invite.user = process.env.MAIL_INVITE_USERNAME;
	mailAuth.invite.pass = process.env.MAIL_INVITE_PASSWORD;
	mailAuth.groups.user = process.env.MAIL_GROUPS_USERNAME;
	mailAuth.groups.pass = process.env.MAIL_GROUPS_PASSWORD;
	mailAuth.support.user = process.env.MAIL_SUPPORT_USERNAME;
	mailAuth.support.pass = process.env.MAIL_SUPPORT_PASSWORD;
}

var transporters = 
{
	invite : nodemailer.createTransport(smtpTransport(
	{
		debug: true,
		host: 'mail.antagonist.nl',
		port: 25,
		secure: false,
		auth: mailAuth.invite,
		authMethod: "PLAIN"
	})),
	groups : nodemailer.createTransport(smtpTransport(
	{
		debug: true,
		host: 'mail.antagonist.nl',
		port: 25,
		secure: false,
		auth: mailAuth.groups,
		authMethod: "PLAIN"
	})),
	support : nodemailer.createTransport(smtpTransport(
	{
		debug: true,
		host: 'mail.antagonist.nl',
		port: 25,
		secure: false,
		auth: mailAuth.support,
		authMethod: "PLAIN"
	}))
};

function sendMail(mailOptions, transporter)
{
	transporter.sendMail(mailOptions, function(error, info)
	{
		if(error) { console.log(error); } else { console.log('Message sent: ' + info.response); }
	});
}

function sendInvite(user, group, invitedUser)
{
	var source_text = fs.readFileSync(templates.invite.text, "utf8");
	var source_html = fs.readFileSync(templates.invite.html, "utf8");
	var template_text = handlebars.compile(source_text);
	var template_html = handlebars.compile(source_html);
	var acceptinvitelink = global.grouplanner.environment == 'local' ? 'http://' + global.grouplanner.ipaddress + ':' + global.grouplanner.port : 'http://www.grouplanner.nl';
	acceptinvitelink += '/invite/' + invitedUser.token;

	var data = {
		subject: 'Invitation from grouplanner',
		inviter: user,
		group: group,
		acceptinvitelink: acceptinvitelink
	};
	var body_text = template_text(data);
	var body_html = template_html(data);

	var mailOptions = {
		from: 'Grouplanner invite <invite@grouplanner.nl>',
		to: invitedUser.email,
		subject: 'Grouplanner invite for ' + group.name,
		text: body_text,
		html: body_html
	};
	
	sendMail(mailOptions, transporters.invite);
}

/*
 *	sendNotification, sends an e-mail notification to users
 *	type = notification type
 *	to = an array of user id's
 *	from = user id of sender
 *	group = id of the group this is pertaining to
 *	data = extra data that goes in the notification
 */
function sendNotification(type, to, from, group, data)
{
	// Vars
	var groupObj = {};	// TODO: get group from db
	var fromObj = {};	// TODO: get from user obj from group
	var toEmails = '';	// TODO: get emails from to users from groupObj
	
	// Set up template data
	var unknownType = false;
	var mailData = {};
	switch(type)
	{
		case 'plannedDate':
			mailData.subject = groupObj.name+' '+groupObj.type+'planned on '+data.date; // SparkPlug rehearsal planned on 10/11/2014
			mailData.group = groupObj;
			mailData.from = fromObj;
			mailData.data = data; // date and notes
		break;
		default: unknownType = true;
		break;
	}
	
	if(!unknownType)
	{
		// Get and build template
		var source_text = fs.readFileSync(templates['notification_'+type].text, "utf8");
		var source_html = fs.readFileSync(templates['notification_'+type].html, "utf8");
		var template_text = handlebars.compile(source_text);
		var template_html = handlebars.compile(source_html);
		var body_text = template_text(mailData);
		var body_html = template_html(mailData);

		// Set up mail options and send
		var mailOptions = {
			from: group.name+' at Grouplanner <groups@grouplanner.nl>',
			to: toEmails,
			subject: groupObj.name+' '+groupObj.type+'planned on '+data.date,
			text: body_text,
			html: body_html
		};
		sendMail(mailOptions, transporters.invite);
	}else{
		console.log('Unknown type of notification requested.');
	}
}

module.exports.sendInvite = sendInvite;
module.exports.sendNotification = sendNotification;
