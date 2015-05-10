/* global $,moment,Period,jshare,localStorage */

/*
 *	Group class
 *
 */
function Group()
{
	var scope = this;

	// Currently active period
	// Default to this week
	this.activePeriod = moment().format('DDMMYYYY');

	// Period length
	// Default 7
	this.periodLength = this.length;

	// Locally loaded periods, by startDate in DDMMYYYY format
	// Contains only this week by default
	this.periods = {};

	// User data
	this.user = {};	// TODO: Move this to App class

	/*
	 *	Initialise the app
	 *
	 */
	this.init = function()
	{
		$('.period-control-button.next').bind('click tap', this.nextPeriod);
		$('.period-control-button.prev').bind('click tap', this.prevPeriod);
		$('#invite #send').bind('click tap', this.sendInvite);
		$('#info #display').bind('click tap', this.editInfo);
		$('#info #edit .btn',edit).bind('click tap', this.saveInfo);
		$('.radio .option').bind('click tap',function(){
			if(!$(this).hasClass('active'))
			{
				$(this).siblings('.active').toggleClass('active');
				$(this).toggleClass('active');
			}
		});
		$('nav .tab').bind('click tap', function(e){
			var t = $(this)

			// Tabs
			$('nav .tab').removeClass('active');
			t.addClass('active');

			// Sections
			$('section').removeClass('active');
			$('section#'+t.data('target')).addClass('active');

			// Save
			localStorage.tab = t.data('target');
		});

		if(localStorage.tab !== undefined && localStorage.tab !== null)
		{
			var tab = localStorage.tab;

			// Tabs
			$('nav .tab').removeClass('active');
			$('nav .tab[data-target="'+tab+'"]').addClass('active');

			// Sections
			$('section').removeClass('active');
			$('section#'+tab).addClass('active');
		}

		$('.remove-user').bind('click tap', scope.removeMember);

		// Get data that is supplied with jshare
		scope.user = jshare.user;

		// Save supplied group data into this object
		for(var key in jshare.group)
		{
			scope[key] = jshare.group[key];
		}

		scope.renderEvents();
		console.log('APP INITIALISED');
	};

	/*
	 *	Load a particular period
	 *	Input a startDate as a DDMMYYYY string
	 */
	this.loadPeriod = function(p)
	{
		this.activePeriod = p;
		// TODO: get data from DB
		// If Period doesn't exist, create new
		if(typeof scope.periods[scope.activePeriod] === 'undefined')
		{
			scope.periods[scope.activePeriod] = new Period({startDate:scope.activePeriod, length:scope.periodLength}, scope);
		}
		scope.periods[scope.activePeriod].activate();
		scope.updateName();
	};

	/*
	 *	Switch to next period and load
	 *
	 */
	this.nextPeriod = function()
	{
		console.log('Loading next period');
		// Get next period in DDMMYYYY string
		var next = moment(scope.activePeriod, 'DDMMYYYY').add(scope.periodLength, 'd').format('DDMMYYYY');
		scope.loadPeriod(next);
	};

	/*
	 *	Switch to previous period and load
	 *
	 */
	this.prevPeriod = function()
	{
		console.log('Loading previous period');
		// Get next period in DDMMYYYY string
		var prev = moment(scope.activePeriod, 'DDMMYYYY').subtract(scope.periodLength, 'd').format('DDMMYYYY');
		scope.loadPeriod(prev);
	};

	/*
	 *	Update period display
	 *
	 */
	this.updateName = function()
	{
		// Update period name display
		var startDay = scope.periods[scope.activePeriod].startDate.format('D MMM');
		var endDay = scope.periods[scope.activePeriod].endDate.format('D MMM');
		var periodName = startDay+' - '+endDay;
		$('#period-controls .period span').text(periodName);
	};

	/*
	 *	Show invite page
	 *
	 */
	this.sendInvite = function()
	{
		var email = $('#invite input').val();
		var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
		if(re.test(email))
		{
			var data = {
				invitedUser:{email:email},
				group:scope._id
			};
			socket.emit('put/invite', data, function(rtnData) {
				if(rtnData.success)
				{
					// TODO: notify user of success more smoothly
					$('#invite input').val('');
					$('#invite #send i').removeClass('icon-mail').addClass('icon-check');
					setTimeout(function(){
						$('#invite #send i').removeClass('icon-check').addClass('icon-mail');
					},1500);
				}else{
					alert('An error occured, please try again later.');
				}
			});
		}else{
			alert("Please provide a valid e-mail address");
		}
	};

	/*
	 *	Edit group info
	 *
	 */
	this.editInfo = function()
	{
		$('#info #display').removeClass('visible');
		$('#info #edit').addClass('visible');
	};

	/*
	 *	Save group info
	 *
	 */
	this.saveInfo = function()
	{
		$('#info #edit').removeClass('visible');
		$('#info #display').addClass('visible');

		if(validate())
		{
			var name = $('#info #edit #name').val();
			var type = $('#info #edit #type').val();
			//var length = $('#info #edit #length').val();
			var data = {
				id:scope._id,
				name:name,
				eventtype:type,
				permissions:
				{
					plan:
					{
						addNewMembers:JSON.parse($('.radio#planning .active').attr('id'))
					},
					settings:
					{
						addNewMembers:JSON.parse($('.radio#settings .active').attr('id'))
					}
				}
			}
			socket.emit('update/group', {group:data,user:jshare.user}, function(rtnData) {
				if(rtnData.success)
				{
					// Update client side
					$('#header #back span').text(rtnData.group.name);
					$('#info #display h2').text(rtnData.group.name);
					$('#info #display p').text(rtnData.group.description);
					scope.name = rtnData.group.name;
					scope.eventtype = rtnData.group.eventtype;
					scope.permissions.plan.addNewMembers = rtnData.group.permissions.plan.addNewMembers;
					scope.permissions.settings.addNewMembers = rtnData.group.permissions.settings.addNewMembers;
				}else{
					alert('There was an error, admins have not been notified. Sucks to be you.'); // lol
				}
			});
		}

		function validate()
		{
			if($('#info #edit #name').val().length === 0)
			{
				alert('A name is required.');
				$('#info #edit').focus();
				return false;
			}
			return true;
		}
	};

	/**
	* Removes current user from the group
	*/
	this.removeMember = function()
	{
		var userId = $(this).data('id');
		var confirmMessage = '';
		if(userId == app.user._id)
		{
			confirmMessage = 'Y u leave group? Are you sure?';
		} else
		{
			var memberToRemove = {};
			$.each(scope.members, function(index, member)
			{
				if(member._id == userId)
				{
					memberToRemove = member;
				}
			});
			confirmMessage = 'Are you sure you want to remove ' + memberToRemove.name.first + ' ' + memberToRemove.name.last + '?';
		}

		if(confirm(confirmMessage))
		{
			socket.emit('delete/group/member', {group:scope._id, member:userId}, function(removedUserId)
			{
				if(removedUserId == app.user._id)
				{
					window.location.href = '/groups';
				} else
				{
					$('.remove-user[data-id=\'' + removedUserId + '\']').parent('.user').remove();
				}
			});
		}
	};

	this.renderEvents = function()
	{
		var compiledTemplate = Handlebars.getTemplate('events');
		var html = $(compiledTemplate(scope.events));
		$('section#updates').html(html);
	};


	this.init();
}
