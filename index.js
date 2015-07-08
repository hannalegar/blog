var mongoose = require('mongoose');
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();

app.use(express.static('public'));
app.engine('.hbs', exphbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

var postSchema = mongoose.Schema({
	title: { type: String, required: 'Nincs megadva cím!',  unique: true }, 
	author: { type: String, required: 'Nincs megadva szerző!' },
	content: { type: String, required: 'Nincsen tartalom!' },
	date: { type: Date, default: Date.now }
});
var commentSchema = mongoose.Schema({
	author: { type: String, required: 'Nincs megadva szerző!' },
	content: { type: String, required: 'Nincsen tartalom!' },
	post_id: mongoose.Schema.Types.ObjectId, 
	date: { type: Date, default: Date.now }
});

var Post = mongoose.model('Post', postSchema);
var Comment = mongoose.model('Comment', commentSchema);
mongoose.connect('mongodb://hanna:userpass@ds053972.mongolab.com:53972/blog');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('DB connection is up');
});

app.get('/', function (req, res) {
	Post.find(function (err, posts){
		if (err) {
			res.send(err);
		} else {
			res.render('index', {
				post: posts,
				helpers: {
					truncate: function (text) {
						return text.substring(0, 100)+'...';
					}
				}				
			});
		}
	}).limit(3);
});

app.get('/posts/:post_id', function (req, res) {
	Post.findOne({ _id : req.params.post_id }, function (err, post){
		if (err) {
			res.send('Nincs ilyen post!');
		} else {
			res.render('post', post);
		}
	})
});

app.get('/posts/:post_id/comments', function (req, res) {
	Comment.find({ post_id : req.params.post_id }, function (err, comment){
		if (err) {
			res.send('Nincs ilyen post!');
		} else {
			res.render('post');
		}
	})
});

app.delete('/posts/:post_id', function (req, res) {
	Post.findOneAndRemove({ _id : req.params.post_id }, function (err, post) {
		if (err) {
			res.send('Nincs ilyen post!');
		} else {
			res.send('A post törölve lett!');
		}
	})
});

app.delete('/posts/:post_id/comments/:comment_id', function (req, res) {
	Comment.findOneAndRemove({ _id : req.params.comment_id, post_id : req.params.post_id }, function (err, comment){
		if (err){
			res.send('Nincs ilyen comment!');
		} else {
			res.send('A comment törölve lett!');
		}
	})
});

app.post('/', function (req, res) {		
	Post.create({ title : req.query.title, author : req.query.author, content : req.query.content }, function (err, post){
		var errmessage = {};
		if (err) {
			if (err.errors.title) {
				errmessage.title = err.errors.title.message;
			}
			if (err.errors.content) {
				errmessage.content = err.errors.content.message;
			}
			if (err.errors.author) {
				errmessage.author = err.errors.author.message;
			}
			res.send(errmessage);
		} else {
			res.send(post);
		}
	})
});

app.post('/posts/:post_id/comments', function (req, res) {
	Comment.create({ author : req.query.author, content : req.query.content, post_id : req.params.post_id }, function (err, comment){
		var errmessage = {};
		if (err) {
			if (err.errors.content){
				errmessage.content = err.errors.content.message;
			}
			if (err.errors.author) {
				errmessage.author = err.errors.author.message;
			}
			res.send(errmessage);
		} else {
			res.send(comment);
		}	
	}) 
});

app.put('/posts/:post_id', function (req, res) {
	var data = {};
	if (req.query.content !== undefined) {
		data.content = req.query.content;
	}
	if (req.query.title !== undefined) {
		data.title = req.query.title;
	}
	Post.findOneAndUpdate({ _id : req.params.post_id },data, function (err, post){
		if (err) {
			res.send('Nincs ilyen post!');
		} else {
			res.send(post);
		}
	})
});

app.put('/posts/:post_id/comments/:comment_id', function (req, res) {
	if (req.query.content !== undefined) {
		Post.content = req.query.content;
	}
	Comment.findOneAndUpdate({ _id : req.params.comment_id, post_id : req.params.post_id }, Post.content, function (err, comment){
		if (err) {
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
