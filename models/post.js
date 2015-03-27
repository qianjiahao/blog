/**
 * Created by qianjiahao on 15/3/23.
 */
var mongodb = require('./db'),
	moment = require('moment'),
	markdown = require('markdown').markdown;


function Post(name, title, tags, post) {
	this.name = name;
	this.title = title;
	this.post = post;
	this.tags = tags;
}

module.exports = Post;

Post.prototype.save = function (callback) {
	var time = {
		year: moment().format('YYYY'),
		month: moment().format('YYYY-MM'),
		day: moment().format('YYYY-MM-DD'),
		minute: moment().format('YYYY-MM-DD HH:mm:ss')
	};

	var post = {
		name: this.name,
		title: this.title,
		post: this.post,
		tags: this.tags,
		time: time,
		comments: [],
		pv: 0
	};

	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.save(post, {
				safe: true
			}, function (err) {
				mongodb.close();
				if (err) return callback(err);

				callback(null);
			});
		});
	});
};

Post.getFive = function (name, page, callback) {
	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {};

			if (name) {
				query.name = name;
			}

			collection.count(query, function (err, total) {

				collection.find(query, {
					skip: ( page - 1 ) * 5,
					limit: 5
				}).sort({
					time: -1
				}).toArray(function (err, docs) {
					mongodb.close();
					if (err) return callback(err);

					if (docs) {
						docs.forEach(function (doc) {
							doc.post = markdown.toHTML(doc.post);
						});
					}
					callback(null, docs, total);

				});
			});

		});
	});
};

Post.getOne = function (name, day, title, callback) {
	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.findOne({
				name: name,
				"time.day": day,
				title: title
			}, function (err, doc) {

				if (err) {
					mongodb.close();
					return callback(err);
				}

				if (doc) {
					collection.update({
						name: name,
						"time.day": day,
						title: title
					}, {
						$inc: {
							pv: 1
						}
					}, function (err) {
						mongodb.close();
						if (err) {
							return callback(err);
						}
					});

					doc.post = markdown.toHTML(doc.post);
					doc.comments.forEach(function (comment) {
						comment.content = markdown.toHTML(comment.content);
					});


					callback(null, doc);
				}


			});
		});
	});
};

Post.edit = function (name, day, title, callback) {
	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.findOne({
				name: name,
				"time.day": day,
				title: title
			}, function (err, doc) {
				mongodb.close();
				if (err) return callback(err);

				callback(null, doc);
			});
		});
	});
};

Post.update = function (name, day, title, post, callback) {
	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.update({
				name: name,
				"time.day": day,
				title: title
			}, {
				$set: {
					post: post
				}
			}, function (err) {
				mongodb.close();
				if (err) return callback(err);

				callback(null);
			});
		});
	});
};


Post.remove = function (name, day, title, callback) {
	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.remove({
				name: name,
				"time.day": day,
				title: title
			}, function (err) {
				mongodb.close();
				if (err) return callback(err);

				callback(null);
			});
		});
	});
};

Post.getArchive = function (callback) {
	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.find({}, {
				name: 1,
				time: 1,
				title: 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) return callback(err);

				callback(null, docs);
			});
		});
	});
};

Post.getTags = function (callback) {
	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.distinct('tags', function (err, tags) {
				mongodb.close();
				if (err) return callback(err);

				callback(null, tags);
			});
		});
	});
};

Post.getTag = function (tag, callback) {
	mongodb.open(function (err, db) {
		if (err) return callback(err);

		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.find({
				tags: tag
			}, {
				name: 1,
				title: 1,
				time: 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();

				if (err) return callback(err);

				callback(null, docs);
			});
		});
	});
};

Post.search = function(keyword,callback){
	mongodb.open(function(err,db){
		if(err) return callback(err);

		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			var pattern = new RegExp(keyword,"i");

			collection.find({
				title:pattern
			},{
				name:1,
				title:1,
				time:1
			}).sort({
				time:-1
			}).toArray(function(err,docs){
				mongodb.close();
				if(err) return callback(err);

				callback(null,docs);
			});
		});
	});
};