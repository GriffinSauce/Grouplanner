/* global $,moment,App,Group,Period */

/*
 *	input an id for creation
 *	an a ready function to call when loaded
 *
 */
function Group(data)
{
	var scope = this;

	// TODO: Build Add member function
	this.addMember = function()
	{

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
			$.each(app.group.members, function(index, member)
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

	// TODO: Build Delete group function
	this.delete = function()
	{

	};

	// Save supplied data into this object
	for(var key in data)
	{
		scope[key] = data[key];
	}
}
