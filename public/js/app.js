/* global Handlebars, $ */
$('#show-comments').click(function () {
	$(this).hide();
	$('#comments').slideDown();
	$('#hide').slideDown();
	$('input').slideDown();
});

$('#post-comment').submit(function (e) {
	$.post(this.action, {
		author: $('#c-author').attr('data-user'),
		content: $('#add-content').val()
	}, function (data){
		console.log(data, this, data.author, data.content,  $('#c-author').attr('data-user'));
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
			 source = '<div class="comment-item" id="comment-{{_id}}"><p>{{content}}</p><a href="/posts/{{post_id}}/comments/{{_id}}" class="delete">Delete</a><a href="/posts/{{post_id}}/comments/{{_id}}" class="edit">Edit</a><h4>{{author}} | {{datum date}}</h4></div>';
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

$('#comments-list').on('click', '.delete', function(e) {
	//console.log(this, arguments, this.href );
	$.ajax(this.href, {
		method: 'DELETE',
		dataType: 'json',
		context: document.activeElement,
		complete: function(){
			//console.log(this, 'parent', $(this).parent()[0])
			$(this).parent().remove();
		}
	})
	e.preventDefault();
});

$('#comments-list').on('click', '.edit', function(e){
	//debugger;
	console.log($(this).parent().find('p'));
	$('#add-comment').hide();
	console.log(this.href);
	$('#edit-c').attr('action', this.href);
	$('#edit-comment').show();
	$('#e-content').val($(this).parent().find('p').text());
	$('#comments-list').hide();
	e.preventDefault();
});

$('#edit-comment').on('submit', '#edit-c', function(e) {
	//console.log(e, this, this.action );
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
	e.preventDefault();
});

$('#index-menu').click(function (e) {
	$('#add-post').show()/*.fadeOut(4000)*/;
	$('#registration').show()/*.fadeOut(4000)*/;
	$('#login-button').show()/*.fadeOut(4000)*/;
	$('#logout').show()/*.fadeOut(4000)*/;
	e.preventDefault();
});

$('#add-post').click(function (e) {
	console.log(this, this.href);
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
	$('#m').show()/*.fadeOut(4000)*/;
	$('#login-button').show()/*.fadeOut(4000)*/;
	$('#registration').show()/*.fadeOut(4000)*/;
	$('#logout').show()/*.fadeOut(4000)*/;
	e.preventDefault();
});

$('#delete-post').click(function (e){
	$.ajax(this.href, {
		method: 'DELETE',
		dataType: 'json',
		complete: function(){
			window.location.replace("http://localhost:3000");
		}
	})
});

$('#edit-post').click(function (e) {
	$('#post').hide();
	$('#author').hide();
	$('#comment').hide();
	$('#posts').hide();
	$('#edit-p').show();
	e.preventDefault();
});

$('#edit-p').on('submit', function(e){
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
	e.preventDefault();
});