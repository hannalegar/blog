var mongoose = require('mongoose');
var express = require('express');
var app = express();

// schema
var postSchema = mongoose.Schema({
	title: String, 
	author: String,
	content: String,
	date: {type: Date, default: Date.now}
});
var commentSchema = mongoose.Schema({
	author: String,
	content: String,
	post_id: mongoose.Schema.Types.ObjectId, //objectid
	date: {type: Date, default: Date.now}
});

// model
var Post = mongoose.model('Post', postSchema);
var Comment = mongoose.model('Comment', commentSchema);
mongoose.connect('mongodb://hanna:userpass@ds053972.mongolab.com:53972/blog');

// error
// once open
// 	Post.find()
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('DB connection is up');
});

Post.schema.path('author').validate( function (value){
	 console.log(value);
	 return value !== undefined;
 }, 'Nincs megadva név!');

/*
Post.schema.path('title').validate( function (value){
	 console.log(value);
	 return value !== undefined;
 }, 'Nincs megadva cím!');

Post.schema.path('content').validate( function (value){
	 console.log(value);
	 return value !== undefined;
 }, 'Nincs megadva tartalom!');*/
 
 
 /*
 var error = {
	 errorMessage: ''
 	}*/


app.get('/posts', function (req, res) {
	Post.find(function (err, posts){
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			res.send(posts);
		}
	})
});

app.get('/posts/:post_id', function (req, res) {
		Post.findOne({ _id : req.params.post_id }, function (err, post){
			if (err) {
				res.send ('Nincs ilyen post!');
				console.log (err);
			} else {
				res.send (post);
			}
		})
});

app.get('/posts/:post_id/comments', function (req, res) {
	
	Comment.find({ post_id : req.params.post_id }, function (err, comment){
		if (err) {
			console.log('Nincs ilyen post!');
			res.send('Nincs ilyen post!');
		} else {
			res.send(comment);
		}
	})
});


app.delete('/posts/:post_id', function (req, res) {

	Post.findOneAndRemove({ _id : req.params.post_id }, function (err, post) {
		if (err) {
			res.send ('Nem vol ilyen post!');
			console.log ('Nem vol ilyen post!');
		} else {
			res.send ('A post törölve lett!');
			console.log(req.params.post_id, post, 'A post törölve lett!');
		}
	})
});


app.delete('/posts/:post_id/comments/:comment_id', function (req, res) {
	
	Comment.findOneAndRemove({ _id : req.params.comment_id, post_id : req.params.post_id }, function (err, comment){
		if (err){
			console.log('Nem volt ilyen comment!');
			res.send('Nem volt ilyen comment!');
		} else {
			console.log('A comment törölve lett!');
			res.send('A comment törölve lett!');
		}
	})
});

app.post('/posts', function (req, res) {		

	/*
	Post.create({ title : req.query.title, author : req.query.author, content : req.query.content }, function (err, post){
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			console.log(post);
			res.send(post);
		}
	})
	*/
	
	var post = new Post ({ title : req.query.title, author : req.query.author, content : req.query.content });
	console.log(post);

	post.save(function (err, post) {
		 if (err ){
			 console.log(err);
			 res.send(err);
		 } else {
			 res.send (post);
		 }
	}) 
});

app.post('/posts/:post_id/comments', function (req, res) {

		Comment.create({ author : req.query.author, content : req.query.content, post_id : req.params.post_id }, function (err, comment){
			if (err) {
				console.log(err);
				res.send(err);
			} else {
				console.log(comment);
				res.send(comment);
			}	
		})  

});

app.put('/posts/:post_id', function (req, res) {
 
	var data = {};
	if ( req.query.content !== undefined ) {
		data.content = req.query.content;
	}
	if ( req.query.title !== undefined ) {
		data.title = req.query.title;
	} else {
		Post.findOneAndUpdate({ _id : req.params.post_id },data, function (err, post){
			if (err) {
				console.log('Nincs ilyen post!');
				res.send('Nincs ilyen post!');
			} else {
				console.log(data);
				res.send(post);
			}
		})
	}
});

app.put('/posts/:post_id/comments/:comment_id', function (req, res) {

	var data = {};
	if ( req.query.content !== undefined ) {
		data.content = req.query.content;
	}
	Comment.findOneAndUpdate({ _id : req.params.comment_id, post_id : req.params.post_id }, data, function (err, comment){
		if (err) {
			console.log('Nincs ilyen comment!');
			res.send('Nincs ilyen comment!');
		} else {
			res.send(comment);
		}
	}) 
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
