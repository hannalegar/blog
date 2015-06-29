/*
	GET /posts
	GET /posts/:id
	GET /posts/:id/comments
	* GET /posts/:id/comments/:id
	
	DELETE /posts/:id
	* DELETE /posts/:id/comments
	DELETE /posts/:id/comments/:id
	
	POST /posts
	POST /posts/:id/comments
	
	PUT /posts/:id
	PUT /posts/:id/comments/:id 
*/

var express = require('express');
var app = express();

var db = {
		posts: {
			1: {
				"id": 1,
				"title": "knfvpemn",
				"content": "pwnfpwem",
				"created_at": "2015-06-25T15:47:45.416Z",
				"posted_by": "lencsi",
				"comments": {
					1: {
						"post_id": "1",
						"id": 1,
						"content": "kngowenfwenmfokenw",
						"created_at": "2015-06-25T15:48:58.791Z",
						"posted_by": "lencsi"
				},
				"lastCommentId": 1
			}
		},			
		lastPostId: 1
		}		
	},
	error = {
		errorMessage: ''
	}
	

    /* posts
    {
        1: {
            id: 1
            title: 'asad',
            content: 'vdasda',
            posted_by: 'dsadsa',
			date:
			comments: {
				1: {
					comment_id:
					content:
					commented_by:_
					date: 
				},
				lastCommentId:0
			}
        },
        2: {
            id: 2
            title: 'asad',
            content: 'vdasda',
            posted_by: 'dsadsa'
        },
		lastPostId: 2
    };
	
	------------------------------------------
	error:
	{
		errorMessage: 'asdasdsadasda'		
	}
    */


/*
GET     /posts      -> db.posts
GET     /posts/1    -> db.posts['1']
GET     /posts/x    -> -
POST    /posts      -> db.posts[id] = { req.params[] }
*/

app.get('/posts', function (req, res) {
	res.send(db.posts);
});

app.get('/posts/:post_id', function (req, res) {
	// var post = db.posts[req.params.post_id]
	// ha post === undefined
	// -> hiba
	// egyébként
	// -> post
	
	var post = db.posts[req.params.post_id];
	
	if (post === undefined) {
		error.errorMessage = 'Nincs ilyen post!';
		res.send(error);
	} else {
		res.send(post);
	}
});

app.get('/posts/:post_id/comments', function (req, res) {
	// var post = db.posts[req.params.post_id]
	// ha post === undefined
	// -> hiba
	// else
	// ??????? posthoz commentet berakni
	// db.posts[post_id].comments =
	
	var post = db.posts[req.params.post_id];
	
	if (post === undefined) {
		error.errorMessage = 'Nincs ilyen post!';
		res.send(error);
	} else {
		res.send(post.comments); 
	}
});

/*
	app.get('/posts/:post_id/comments/:comment_id', function(req, res){
		res.send('');
	});
	
*/

app.delete('/posts/:post_id', function (req, res) {
	// var post = db.posts[req.params.post_id]
	// ha post === undefined
	// -> hiba
	// egyébként
	// db.posts[req.params.post_id] torles
	// uzi
	
	var post = db.posts[req.params.post_id];
	if (post === undefined) {
		error.errorMessage = 'Nem vol ilyen post';
		res.send(error);
	} 
	
	delete  db.posts[req.params.post_id];
	res.send('A post törölve lett!');
	
});

/*
app.delete('/posts/:post_id/comments', function (req, res) {
	res.send('Got a DELETE request at /posts/:post_id/comments);
});
*/

app.delete('/posts/:post_id/comments/:comment_id', function (req, res) {
	var post = db.posts[req.params.post_id],
		comment = post.comments[req.params.comment_id];
		
	if (post === undefined || comment === undefined) {
		error.errorMessage = 'Nincsen mit törölni!';
		res.send(error);
	} 
	
	delete db.posts[req.params.post_id].comments[req.params.comment_id];
	res.send('A comment törölve!');
	
});

app.post('/posts', function (req, res) {		
	var isOk = true,
		post_number;
	
	if (req.query.title === undefined) {
		error.errorMessage += "Nincs megadva cím!\n";
		isOk = false;
	} 
	
	if (req.query.content === undefined) {
		error.errorMessage += "Hiányzik a tartalom!\n";
		isOk = false;
	}
	
	if (req.query.posted_by === undefined) {
		error.errorMessage += "Nincs megadva név!\n";	
	}
	
	if (!isOk) {
		return res.send(error);
	}
					 
	post_number =  ++db.posts.lastPostId;		

	db.posts[post_number] = {
		id: post_number, 
		title: req.query.title, //post-oltam
		content: req.query.content, //post-oltam
		created_at: new Date(), //datumot ;)
		posted_by: req.query.posted_by, // post-oltam
		comments: {
			lastCommentId: 0
		}
	}
	res.send(db.posts[post_number]);
});

app.post('/posts/:post_id/comments', function (req, res) {
	var isOk = true,
		post = db.posts[req.params.post_id],
		comment_number;
	
	if (req.query.content === undefined) {
		error.errorMessage += "Nincsen a commentnek tartalma!\n";
		isOk = false;
	} 
	if (req.query.posted_by === undefined) {
		error.errorMessage += "Név nélkül nem lehet posztolni!\n";
		isOk = false;
	}
	if (!isOk) {
		res.send(error);
	} 
	
	comment_number = ++ db.posts[req.params.post_id].comments.lastCommentId;
					
	post.comments[comment_number] = {
		post_id: req.params.post_id, //a felso post id
		id:  comment_number, //random szam,
		content: req.query.content, //post-oltam,
		created_at: new Date(), //tudod mit kell itt csinal
		posted_by: req.query.posted_by //post-oltam
	};
				
	res.send(post.comments[comment_number]); 
	
});

app.put('/posts/:post_id', function (req, res) {
	var post = db.posts[req.params.post_id];
	
	if (post === undefined) {
		error.errorMessage = 'Nincs ilyen post!';
		res.send(error);
	}
	
	post.content = req.query.content,
	post.title = req.query.title;
	res.send(post);
	
});

app.put('/posts/:post_id/comments/:comment_id', function (req, res) {
	var post = db.posts[req.params.post_id],
		comment = post.comments[req.params.comment_id],
		isOk = true;
	
	error.errorMessage = '';
	
	if (post === undefined || comment === undefined) {
		error.errorMessage += 'Nincs módosítani való!';
		return res.send(error);
	}	
	if (!req.query.content) {
		error.errorMessage += 'Nincs tartalom!';
		isOk = false;			
	}
	if (!req.query.posted_by) {
		error.errorMessage += 'Nincs szerzo!';		
		isOk = false;			
	}
	
	if (!isOk) {
		return res.send(error);
	}
	
	if (comment.content === req.query.content) {
		return res.send(comment);
	}
	
	comment.content = req.query.content;
	res.send(comment);
	
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
