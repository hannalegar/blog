/* global Handlebars, $ */
$('#show-comments').click(function () {
	$(this).hide();
	$('#comments').slideDown();
	$('#hide').slideDown();
	$('input').slideDown();
});

$('#post-comment').submit(function (e) {
	$.post(this.action, {
		author: $('#c-author').val(),
		content: $('#content').val()
	}, function (data){
		console.log(data, this, data.author, data.content,  $('#c-author').val());
		var source, template;
		if (!data._id) {
			//error ag
			if (data.author) {
				$('#invalid-a').text(data.author).show().fadeOut(3000);
			}
			if (data.content) {
				$('#invalid-c').text(data.content).show().fadeOut(3000);
			}
		} else {
			 source = '<a href="/posts/{{post_id}}/comments/{{_id}}" class="delete">Delete comment</a><p>{{content}}</p><h4>{{author}} | {{datum date}}</h4>';
			 template = Handlebars.compile(source);
			 $('#no-c').remove();
			 $('#post-comment')[0].reset();
			 $('#comments-list').append(template(data));
		}
	}, 'JSON');
	e.preventDefault();
});

Handlebars.registerHelper('datum', function(dat){
	var d = new Date(dat);
	return d.toString().substring(0,3)+' '+d.getDate()+' '+d.getMonth()+' '+d.getFullYear();
});

$('#comments-list').on('click', '.delete', (function(e) {
	console.log(this, arguments, this.href );
	$.ajax(this.href, {
		method: 'DELETE',
		dataType: 'json',
		context: document.activeElement,
		complete: function(){
			console.log(this, $(this).parent()[0])
			$(this).parent().remove();
		}
	})
	e.preventDefault();
}));