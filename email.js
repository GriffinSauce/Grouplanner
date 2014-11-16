#!/bin/env node

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');
var handlebars = require('handlebars');
var mailAuth = {};

var templates =
{
	invite:
	{
		text: __dirname + '/emailtemplates/invite_text.handlebars',
		html: __dirname + '/emailtemplates/invite_html.handlebars'
	}
};

if(global.grouplanner.environment == 'local')
{
	var settingsJson = require(__dirname + '/secrets.json');
	mailAuth.user = settingsJson.mail.username;
	mailAuth.pass = settingsJson.mail.password;
} else
{
	mailAuth.user = process.env.MAIL_USERNAME;
	mailAuth.pass = process.env.MAIL_PASSWORD;
}
console.log(mailAuth);

var transporter = nodemailer.createTransport(smtpTransport(
{
    debug: true,
	host: 'mail.antagonist.nl',
    port: 25,
	secure: false,
    auth: mailAuth,
	authMethod: "PLAIN"
}));

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

	sendMail(mailOptions);
}

function sendMail(mailOptions)
{
	transporter.sendMail(mailOptions, function(error, info)
	{
		if(error) { console.log(error); } else { console.log('Message sent: ' + info.response); }
	});
}


module.exports.sendInvite = sendInvite;
