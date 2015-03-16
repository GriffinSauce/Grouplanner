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
		socket.emit('delete/group/member', {group:scope._id, member:$(this).data('id')}, function(removedUserId)
		{
			if(removedUserId == app.user._id)
			{
				window.location.href = '/groups';
			} else
			{
				$('.remove-user[data-id=\'' + removedUserId + '\']').parent('.user').remove();
			}
		});
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
