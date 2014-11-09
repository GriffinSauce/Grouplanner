#!/bin/env node

var nodemailer = require('nodemailer');
var fs = require('fs');
var handlebars = require('handlebars');

var templates =
{
	invite:
	{
		text: __dirname + '/emailtemplates/invite_text.handlebars',
		html: __dirname + '/emailtemplates/invite_html.handlebars'
	}
};

var transporter = nodemailer.createTransport(
{
    service: 'Gmail',
    auth: {
        user: '',
        pass: ''
    }
});

function sendInvite(user, group, invitedUser)
{
	var source_text = fs.readFileSync(templates.invite.text, "utf8");
	var source_html = fs.readFileSync(templates.invite.html, "utf8");
	var template_text = handlebars.compile(source_text);
	var template_html = handlebars.compile(source_html);

	var data = {
		subject: 'Invitation from grouplanner',
		inviter: user,
		group: group,
		acceptinvitelink: ''
	};
	var body_text = template_text(data);
	var body_html = template_html(data);

	var mailOptions = {
		from: 'Grouplanner invite <invites@grouplanner.com>',
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
