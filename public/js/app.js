/* global Handlebars, $ */
$('#show-comments').click(function () {
	$(this).hide();
	$('#comments').slideDown();
	$('#hide').slideDown();
	$('input').slideDown();
});

$('#post-comment').submit(function (e) {
	e.preventDefault();
	$.post(this.action, {
			author: $('#c-author').attr('data-user'),
			content: $('#add-content').val()
		}, function (data){
			var source, template;
			if (!data._id) {
				if (data.author) {
					$('#invalid-a').text(data.author).show().fadeOut(3000);
				}
				if (data.content) {
					$('#invalid-c').text(data.content).show().fadeOut(3000);
				}
			} else {
				 source = '<div class="comment-item" id="comment-{{_id}}"><p>{{content}}</p><a href="/posts/{{post_id}}/comments/{{_id}}" class="delete">Delete</a><a href="/posts/{{post_id}}/comments/{{_id}}" class="edit">Edit</a><h4>{{author}} | {{datum date}}</h4></div>';
				 template = Handlebars.compile(source);
				 $('#no-c').remove();
				 $('#post-comment')[0].reset();
				 $('#comments-list').append(template(data));
			}
		}, 'JSON');
});

Handlebars.registerHelper('datum', function(dat){
	var d = new Date(dat);
	return d.toString().substring(0,3)+' '+d.getDate()+' '+d.getMonth()+' '+d.getFullYear();
});

$('#comments-list').on('click', '.delete', function(e) {
	e.preventDefault();
	$.ajax(this.href, {
		method: 'DELETE',
		dataType: 'json',
		context: document.activeElement,
		complete: function(){
			$(this).parent().remove();
		}
	});
});

$('#comments-list').on('click', '.edit', function(e){
	e.preventDefault();
	$('#add-comment').hide();
	$('#edit-c').attr('action', this.href);
	$('#edit-comment').show();
	$('#e-content').val($(this).parent().find('p').text());
	$('#comments-list').hide();
});

$('#edit-comment').on('submit', '#edit-c', function(e) {
	e.preventDefault();
	$.ajax(this.action, {
		method: 'PUT',
		dataType: 'json',
		data: {
			"content": $("#e-content").val()
		},
		complete: function(data){
			$('#comment-' + data.responseJSON._id+' p').text(data.responseJSON.content);
		}
	});
	$('#edit-comment').hide();
	$('#comments-list').show();
	$('#add-comment').show();
});

$('#index-menu').click(function (e) {
	e.preventDefault();
	$('#add-post').show()/*.fadeOut(4000)*/;
	$('#registration').show()/*.fadeOut(4000)*/;
	$('#login-button').show()/*.fadeOut(4000)*/;
	$('#logout').show()/*.fadeOut(4000)*/;
});

$('.post').on('click', '.edit-post', function(e){
	e.preventDefault();
});

var files = [];

$('input[type=file]').on('change', function (event){
  files = event.target.files;
});

$('#new-post').submit(function (e) {
	e.preventDefault();	
	var data = new FormData();
	$.each(files, function(key, value){
		data.append('file', value);
	});
	
	data.append('author', $('#n-author').attr('data-user'));
	data.append('title', $('#n-title').val());
	data.append('content', $('#n-content').val());
	
	$.ajax(this.action, { 
		type: 'POST',
		data: data,
		cache: false,
		dataType: 'json',
		processData: false,
		contentType: false,
		success: function(data) {
			console.log(data);
			if (!data._id) {
				if(data.author){
					$('#invalid-nauthor').text(data.author).show().fadeOut(3000);
				}
				if (data.title) {
					$('#invalid-ntitle').text(data.title).show().fadeOut(3000);
				}
				if (data.content) {
					$('#invalid-ncontent').text(data.content).show().fadeOut(3000);
				}
			} else {
				var url = "http://localhost:3000/posts/"+data._id;
				window.location.replace(url);
			}
		},
		error: function(){
			window.location.replace("http://localhost:3000");
		}
	});
});

$('#post-menu').click(function (e){
	e.preventDefault();
	$('#m').show()/*.fadeOut(4000)*/;
	$('#login-button')/*.show().fadeOut(4000)*/;
	$('#registration')/*.show().fadeOut(4000)*/;
	$('#logout').show()/*.fadeOut(4000)*/;
});

$('#delete-post').click(function (e){
	$.ajax(this.href, {
		method: 'DELETE',
		dataType: 'json',
		complete: function(){
			window.location.replace("http://localhost:3000");
		}
	});
});

$('#edit-post').click(function (e) {
	e.preventDefault();
	$('#post').hide();
	$('#author').hide();
	$('#comment').hide();
	$('#posts').hide();
	$('#edit-p').show();
});

$('#edit-p').on('submit', function(e){
	e.preventDefault();
	$.ajax(this.action, {
		method: 'PUT',
		dataType: 'json',
		data: {
			"title": $('#edit-title').val(),
			"content": $('#postedit-content').val()
		},
		complete: function(data){
			$('#post-title h1').text(data.responseJSON.title);
			$('.content').text(data.responseJSON.content);
		}
	});
	$('#post').show();
	$('#author').show();
	$('#comment').show();
	$('#posts').show();
	$('#edit-p').hide();
});