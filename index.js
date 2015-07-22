var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var multer = require('multer');

var upload = multer({storage: multer.diskStorage({
		destination: function(req, file, cb) {
			cb(null, './public/images/user/');
		},
		filename: function(req, file, cb){
			cb(null, file.originalname);
		}
	}),
	fileFilter: function(req, file, cb){
		if (file.mimetype == 'image/jpeg') {
			cb(null, true);	
		} else {
			cb(null, false);
		}
	}
});	

var app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.engine('.hbs', exphbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

var Account = require('./models/account');
/*
passport.serializeUser(function(user, done) {
  done(null, Account._id);
});

passport.deserializeUser(function(id, done) {
  Account.findById(id, function(err, user) {
    done(err, user);
  });
});*/

passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser(function(user, done){
	done(null, Account._id);
}));
	
passport.deserializeUser(Account.deserializeUser(function(id, done){
	Account.findById(id, function(err, user){
		done(err, user);
	})
}));

var postSchema = mongoose.Schema({
	title: { type: String, required: 'Nincs megadva cím!',  unique: true }, 
	author: { type: String, required: 'Nincs megadva szerző!' },
	content: { type: String, required: 'Nincsen tartalom!' },
	file: {type: String },
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

app.get('/register', function(req, res){
	res.render('reg', {});
})

app.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            console.log(err);
			return res.render('reg', { account : account });
        }
        passport.authenticate('local')(req, res, function () {
            console.log('success', account);
			res.redirect('/');
        });
    });
});

app.get('/login', function(req, res){
	console.log('login', { user : req.user});
	res.render('login', { user : req.user});
});

app.post('/login', passport.authenticate('local'), function(req, res) {
    console.log('login', { user : req.user});
	console.log('success login');
	res.redirect('/');
});

app.get('/logout', function(req, res) {
    console.log('logout');
	req.logout();
    res.redirect('/');
});

app.get('/:page?', function (req, res) {
	var	skip = 0, limit = 3, page = req.params.page, all;
	
	if (page === 'new') {
		res.render('new', { user : req.user});
	}
	else if (page === 'register') {
		res.render('reg');
	} else {
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
				all = Math.ceil(count / limit);
			}
		})
		Post.find(function (err, posts){
			if (err) {
				res.send(err);
			} else {
				console.log({ user : req.user});
				res.render('index', {
					post: posts,
					page: page + 1,
					all: all, 
					user: req.user,
					helpers: {
						truncate: function (text) {
							if (text.length < 100) {
								return text;
							} 
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
	}
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
			console.log(post, next, prev, comment, { user : req.user});
			res.render('post', {			
				post: post,
				next: next,
				prev: prev,
				comment: comment,
				user: req.user,
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

app.post('/', upload.single('file'), function (req, res) {		
	console.log('post');
	//console.log(req.file);
	//console.log(req.files);
	var data = {
		author: req.body.author,
		title: req.body.title,
		content: req.body.content,
		file: ''
	}
	if (req.file) {
		console.log(req.file);
		data.file = req.file.filename;
	}
	Post.create( data, function (err, post){
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
			console.log(data);
			res.send(errmessage);
		} else {
			console.log(data);
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
	console.log('put');
	var data = {};
	if (req.body.content !== undefined) {
		data.content = req.body.content;
	}
	if (req.body.title !== undefined) {
		data.title = req.body.title;
	}
	Post.findOneAndUpdate({ _id : req.params.post_id }, data, { new: true }, function (err, post){
		console.log('put', post);
		if (err) {
			res.send('Nincs ilyen post!');
		} else {
			res.send(post);
		}
	})
});

app.put('/posts/:post_id/comments/:comment_id', function (req, res) {
	var data = {};
	if (req.body.content !== undefined) {
		data.content = req.body.content;
	}
	Comment.findOneAndUpdate({ _id : req.params.comment_id, post_id : req.params.post_id }, data, { new: true }, function (err, comment){
		//console.log('comment', comment);
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
