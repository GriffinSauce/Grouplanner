$(document).ready(function(){
	$('#createGroupBtn').click(function(){
		// TODO: Submit data
		// TODO: Nav to planner
	})
	$('.radio .option').click(function(){
		if(!$(this).hasClass('active'))
		{
			$(this).siblings('.active').toggleClass('active');
			$(this).toggleClass('active');
		}
	})
});