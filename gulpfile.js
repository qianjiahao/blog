/**
 * Created by qianjiahao on 15/3/24.
 */
var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	del = require('del'),
	livereload = require('gulp-livereload');

gulp.task('app', function () {
	gulp.src('./app.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(uglify())
		.pipe(gulp.dest('./dest'))
		.pipe(livereload());
});


gulp.task('index', function () {
	gulp.src('./routes/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(uglify())
		.pipe(gulp.dest('./dest'))
		.pipe(rename('index.min.js'))
		.pipe(livereload());
});

gulp.task('models', function () {
	gulp.src('./models/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(concat('model.js'))
		.pipe(gulp.dest('./dest'))
		.pipe(rename('model.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./dest'))
		.pipe(livereload());
});

gulp.task('gulpfile',function(){
	gulp.src('gulpfile.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(livereload());
});


gulp.task('clean', function (cb) {

	del(['dest/**/*'], ['log/*.js'], cb);

});



gulp.task('watch', function () {

	gulp.watch('./app.js',['app']);

	gulp.watch('./routes/*.js', ['index']);

	gulp.watch('./models/*.js', ['models']);

	gulp.watch('gulpfile.js',['gulpfile']);

});


gulp.task('default',['clean'], function () {

	gulp.run('app','index', 'models', 'gulpfile','watch');

});