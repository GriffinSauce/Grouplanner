var socket = io();
/*
 *	Group creation
 *
 *
 */
$(document).ready(function(){

	$('.numberBtn#minus').bind('click tap',function(){
		var val = parseInt($('#form #length').val());
		val -= val !== 0 ? 1 : 0;
		$('#form #length').val(val);
	});
	$('.numberBtn#plus').bind('click tap',function(){
		var val = parseInt($('#form #length').val());
		val++;
		$('#form #length').val(val);
	});

	$('#createGroupBtn').bind('click tap',function(){

		if(validate())
		{
			var name = $('#form #name').val();
			var type = $('#form #type').val();
			var length = $('#form #length').val();
			var description = "We're called "+name+" and we plan "+type+" once every "+length+" days.";
			var data = {
				name:name,
				eventtype:type,
				periodLength:length,
				description:description,
				startDate:moment().weekday(1).toDate(),
				permissions:
				{
					plan:
					{
						allowed:jshare.user._id,
						addNewMembers:JSON.parse($('.radio#planning .active').attr('id'))
					},
					settings:
					{
						allowed:jshare.user._id,
						addNewMembers:JSON.parse($('.radio#settings .active').attr('id'))
					}
				}
			}
			socket.emit('create/group', {group:data,user:jshare.user}, function(rtnData) {
				if(rtnData.success)
				{
					window.location.href = '/group/'+rtnData.id;
				}else{
					alert('Error 2'); // lol
				}
			});
		}
	});

	$('.radio .option').bind('click tap',function(){
		if(!$(this).hasClass('active'))
		{
			$(this).siblings('.active').toggleClass('active');
			$(this).toggleClass('active');
		}
	});
});

function validate()
{
	if($('#form #name').val().length === 0)
	{
		alert('A name is required.');
		$('#form #name').focus();
		return false;
	}
	if($('#form #length').val().length === 0)
	{
		alert('Please fill in how often you want to plan '+$('#form #type').val()+'. \nIt must be a number.');
		$('#form #length').focus();
		return false;
	}
	return true;
}
