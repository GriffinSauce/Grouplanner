/* global $,moment,App,Group,Period,jshare,localStorage */

/*
 *	App class
 *
 */
function App()
{
	var scope = this;

	// Currently active period
	// Default to this week
	this.activePeriod = moment().format('DDMMYYYY');

	// Currently active group
	// TODO: Supply Group ID (from select, localstorage or default for the user)
	// TODO: Remove dummy
	this.group = {};

	// Period length
	// Default 7
	this.periodLength = this.group.length;

	// Data contains locally loaded periods, by startDate in DDMMYYYY format
	// Contains only this week by default
	this.data = {};

	// User data
	this.user = {};

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
		var edit = $('#info #edit');
		$('.btn',edit).bind('click tap', this.saveInfo);
		$('.numberBtn#minus',edit).bind('click tap',function(){
			var val = parseInt($('#length',edit).val());
			val -= val !== 0 ? 1 : 0;
			$('#length',edit).val(val);
		});
		$('.numberBtn#plus',edit).bind('click tap',function(){
			var val = parseInt($('#length',edit).val());
			val++;
			$('#length',edit).val(val);
		});
		$('.radio .option').bind('click tap',function(){
			if(!$(this).hasClass('active'))
			{
				$(this).siblings('.active').toggleClass('active');
				$(this).toggleClass('active');
			}
		});

		// Get data that is supplied with jshare
		scope.user = jshare.user;
		scope.group = new Group(jshare.group);
		scope.periodLength = scope.group.periodLength;

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
		if(typeof scope.data[scope.activePeriod] === 'undefined')
		{
			scope.data[scope.activePeriod] = new Period({startDate:scope.activePeriod, length:scope.periodLength});
		}
		scope.data[scope.activePeriod].activate();
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
		var startDay = scope.data[scope.activePeriod].startDate.format('D MMM');
		var endDay = scope.data[scope.activePeriod].endDate.format('D MMM');
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
				group:scope.group._id
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
			var length = $('#info #edit #length').val();
			var data = {
				id:app.group._id,
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
					$('#header #back span').text(name);
					$('#info #display h2').text(name);
					scope.group.name = data.name;
					scope.group.eventtype = data.eventtype;
					scope.group.permissions.plan.addNewMembers = data.permissions.plan.addNewMembers;
					scope.group.permissions.settings.addNewMembers = data.permissions.settings.addNewMembers;
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
			if($('#info #edit #length').val().length === 0)
			{
				alert('Please fill in how often you want to plan '+$('#info #edit #type').val()+'. \nIt must be a number.');
				$('#info #edit #length').focus();
				return false;
			}
			return true;
		}
	};


	this.init();
}
