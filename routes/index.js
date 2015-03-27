var crypto = require('crypto'),
	moment = require('moment'),
	User = require('../models/user'),
	Post = require('../models/post'),
	Comment = require('../models/comment'),
	logger = require('../common/log').logger;


module.exports = function (app) {
	app.get('/', function (req, res) {
		var page = req.query.p ? parseInt(req.query.p) : 1;
		Post.getFive(null, page, function (err, posts, total) {
			if (err) {
				posts = [];
			}
			res.render('index', {
				title: '主页',
				user: req.session.user,
				posts: posts,
				page: page,
				isFirstPage: (page - 1) === 0,
				isLastPage: ((page - 1) * 5 + posts.length) == total,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});

	});

	app.get('/login', checkNotLogin);
	app.get('/login', function (req, res) {
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/login', checkNotLogin);
	app.post('/login', function (req, res) {
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');

		User.get(req.body.name, function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			if (!user) {
				req.flash('error', '用户名不存在');
				return res.redirect('/login');
			}
			if (password != user.password) {
				req.flash('error', '密码错误');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', '登录成功');
			res.redirect('/');
		});
	});

	app.get('/reg', checkNotLogin);
	app.get('/reg', function (req, res) {
		res.render('reg', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/reg', checkNotLogin);
	app.post('/reg', function (req, res) {
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'],
			email = req.body.email;
		if (password != password_re) {
			req.flash('error', '密码不一致');
			return res.redirect('/reg');
		}

		var md5 = crypto.createHash('md5');

		password = md5.update(password).digest('hex');

		var newUser = new User({
			name: name,
			password: password,
			email: email
		});

		User.get(newUser.name, function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}

			if (user) {
				req.flash('error', '用户已存在');
				return res.redirect('/reg');
			}
			newUser.save(function (err, user) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user = user;
				req.flash('success', '注册成功');
				res.redirect('/');
			});

		});
	});

	app.get('/post', checkLogin);
	app.get('/post', function (req, res) {
		logger.info('this is post')
		res.render('post', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post', checkLogin);
	app.post('/post', function (req, res) {
		var currentUser = req.session.user,
			tags = [req.body.tag1, req.body.tag2, req.body.tag3],
			post = new Post(currentUser.name, req.body.title, tags, req.body.post);
		post.save(function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', '发布成功');
			res.redirect('/');
		});
	});

	app.get('/upload', checkLogin);
	app.get('/upload', function (req, res) {
		res.render('upload', {
			title: '上传',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/upload', checkLogin);
	app.post('/upload', function (req, res) {
		req.flash('success', '上传成功');
		res.redirect('/upload');
	});


	app.get('/logout', checkLogin);
	app.get('/logout', function (req, res) {
		req.session.user = null;
		req.flash('success', '登出成功');
		res.redirect('/');
	});

	app.get('/search', function (req, res) {
		Post.search(req.query.keyword, function (err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('search', {
				title: 'Search:' + req.query.keyword,
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.get('/links', function (req, res) {
		res.render('links', {
			title: 'Links',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.get('/u/:name', checkLogin);
	app.get('/u/:name', function (req, res) {
		var page = req.query.p ? parseInt(req.query.p) : 1;
		User.get(req.params.name, function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			if (!user) {
				req.flash('error', '用户名不存在');
				return res.redirect('/');
			}
			Post.getFive(user.name, page, function (err, posts, total) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title: user.name,
					user: req.session.user,
					posts: posts,
					page: page,
					isFirstPage: (page - 1) === 0,
					isLastPage: ((page - 1) * 5 + posts.length ) == total,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	});
	app.get('/u/:name/:day/:title', checkLogin);
	app.get('/u/:name/:day/:title', function (req, res) {
		Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('article', {
				title: req.params.title,
				user: req.session.user,
				post: post,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.post('/u/:name/:day/:title', checkLogin);
	app.post('/u/:name/:day/:title', function (req, res) {
		var time = moment().format('YYYY-MM-DD HH-mm-ss');

		var comment = {
			name: req.body.name,
			title: req.body.title,
			time: time,
			website: req.body.website,
			content: req.body.content,
			head: req.session.user.head
		};
		var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
		newComment.save(function (err) {
			if (err) {
				req.flash('error', err);
				res.redirect('back');
			}
			req.flash('success', '评论成功');
			res.redirect('back');
		});
	});


	app.get('/edit/:name/:day/:title', checkLogin);
	app.get('/edit/:name/:day/:title', function (req, res) {
		Post.edit(req.params.name, req.params.day, req.params.title, function (err, post) {
			if (err) {
				req.flash('error', err);
				res.redirect('back');
			}
			res.render('edit', {
				title: 'edit',
				user: req.session.user,
				post: post,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.post('/edit/:name/:day/:title', checkLogin);
	app.post('/edit/:name/:day/:title', function (req, res) {
		Post.update(req.session.user.name, req.params.day, req.params.title, req.body.post, function (err) {
			var url = encodeURI('/u/' + req.session.user.name + '/' + req.params.day + '/' + req.params.title);
			if (err) {
				req.flash('error', err);
				return res.redirect(url);
			}
			req.flash('success', '修改成功');
			res.redirect(url);
		});
	});

	app.get('/remove/:name/:day/:title', checkLogin);
	app.get('/remove/:name/:day/:title', function (req, res) {
		Post.remove(req.params.name, req.params.day, req.params.title, function (err) {
			if (err) {
				req.flash('error', err);
				res.redirect('back');
			}
			req.flash('success', '删除成功');
			res.redirect('/');
		});
	});

	app.get('/archive', function (req, res) {
		Post.getArchive(function (err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}

			res.render('archive', {
				title: 'archive',
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.get('/tags', function (req, res) {
		Post.getTags(function (err, tags) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('tags', {
				title: 'tags',
				user: req.session.user,
				tags: tags,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.get('/tags/:tag', function (req, res) {
		Post.getTag(req.params.tag, function (err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}

			res.render('tag', {
				title: 'Tag :' + req.params.tag,
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.use(function (req, res) {
		res.render('404');
	});
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录');
			return res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登录');
			return res.redirect('back');
		}
		next();
	}

};
