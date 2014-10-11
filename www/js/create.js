/*
 *	Group creation
 *
 *
 */
$(document).ready(function(){
	$('#createGroupBtn').click(function(){
		
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
			console.log( "Returned data:"+ JSON.parse(data) );
			alert('Success!');
			window.location.href = '/planner';
		});
	})
	$('.radio .option').click(function(){
		if(!$(this).hasClass('active'))
		{
			$(this).siblings('.active').toggleClass('active');
			$(this).toggleClass('active');
		}
	})
});