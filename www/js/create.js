/*
 *	Group creation
 *
 *
 */
$(document).ready(function(){
	$('#createGroupBtn').click(function(){
		
		if(validate())
		{
			var name = $('#form #name').val();
			var type = $('#form #type').val();
			var length = $('#form #length').val();
			var description = "We're called "+name+" and we plan "+type+" once every "+length+" days.";

			var data = {
				name:name,
				eventtype:type,
				lenght:length,
				description:description
			}
			$.ajax({
				url: '/group',
				type: 'PUT',
				data: data
			})
			.done(function( data ) {
				if(data.success)
				{
					alert('Success!');
					window.location.href = '/planner';
				}else{
					alert('Error 2'); // lol
				}
			});
		}
	});
	
	$('.radio .option').click(function(){
		if(!$(this).hasClass('active'))
		{
			$(this).siblings('.active').toggleClass('active');
			$(this).toggleClass('active');
		}
	})
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