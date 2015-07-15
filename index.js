var mongoose = require('mongoose');
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded());
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

app.get('/:page?', function (req, res) {
	var	skip = 0, limit = 3, page = req.params.page, all;
	if (page) {
		page = page - 0;
		skip = page * limit;		
	} else {
		page = 0;
	}
	Post.count( {}, function (err, count){
		if (err) {
			console.log(err);
		} else {
			all = count / limit;
		}
	})
	Post.find(function (err, posts){
		if (err) {
			res.send(err);
		} else {
			res.render('index', {
				post: posts,
				page: page + 1,
				all: all, 
				helpers: {
					truncate: function (text) {
						return  text.split(' ').slice(0, 50).join(' ') + '...'
					},
					datum: function (d) {
						if(!d) { return ''; }
						return d.toString().substring(0,3) + ' ' + d.getDate() + ' ' + d.getMonth() + ' ' + d.getFullYear();
					}
				}				
			});
		}
	}).limit(limit).skip(skip).sort({date:-1});
});

app.get('/posts/:post_id', function (req, res) {
	var promise, post, next, prev, comment,
		post_id = req.params.post_id;
	
	promise = Post.findOne({ _id : req.params.post_id }).sort({ _id: -1 }).limit(1).exec();
	
	promise.then(function (foundPost) {		
		console.log('post found');
		post = foundPost;
		return Post.findOne({ _id: { $gt: post_id }}).sort({ _id: 1 }).exec();	
	}).then(function (nextFound) {
		next = nextFound;
		console.log('next found');
		return Post.findOne({ _id: { $lt: post_id }}).sort({ _id: -1 }).exec(); 
	}).then(function (prevFound) {
		prev = prevFound;
		console.log('prev found');
		//console.log(post, next, prevFound);
		return Comment.find({ post_id : req.params.post_id }).sort({ date : 1});
	}).then (function (comments){
		comment = comments;
		console.log('comments found');
	}).then(function (err, foundPost, nextFound, prevFound, comments){
		if (err) {
			console.log(err);
		} else {
			console.log(post, next, prev, comment);
			res.render('post', {			
				post: post,
				next: next,
				prev: prev,
				comment: comment,
				helpers: {
					datum: function (d) {
						if(!d) { return ''; }
						return d.toString().substring(0,3)+' '+d.getDate()+' '+d.getMonth()+' '+d.getFullYear();
					},
					truncate: function (text) {
						if (text.length < 100) {
							return text;
						} 
						return  text.split(' ').slice(0, 20).join(' ') + '...';
					}
				}
			})
		}
	})
});

app.get('/posts/:post_id/comments', function (req, res) {
	Comment.find({ post_id : req.params.post_id }, function (err, comment){
		if (err) {
			res.send('Nincs ilyen post!');
		} else {
			console.log('render comments');
			// res.render('comment', {
			// 	comment: comment,
			// })
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
	Post.create({ title : req.body.title, author : req.body.author, content : req.body.content }, function (err, post){
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
	Comment.create({ author : req.body.author, content : req.body.content, post_id : req.params.post_id }, function (err, comment){
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
	if (req.body.content !== undefined) {
		data.content = req.body.content;
	}
	if (req.body.title !== undefined) {
		data.title = req.body.title;
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
	if (req.body.content !== undefined) {
		Post.content = req.body.content;
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
