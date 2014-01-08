var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var jshint = require('gulp-jshint');

gulp.task('check', function() {
	gulp.src(['assets/javascripts/**', '!assets/javascripts/graph_components/class.js'])
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
});

gulp.task('dashboard', function() {
	//single entry point to browserify
	gulp.src(['assets/javascripts/power_dashboard.js'])
	.pipe(browserify({
		insertGlobals : true,
		debug : false
	}))
	.pipe(concat('dashboard.js'))
	.pipe(gulp.dest('./build'))
});

gulp.task('scripts', ['check', 'dashboard'], function() {
	var stream = gulp.src([
		'assets/bower_components/underscore/underscore.js',
		'assets/bower_components/backbone/backbone.js',
		'assets/bower_components/jquery-tiny-pubsub/dist/ba-tiny-pubsub.js',
		'assets/bower_components/json2/json2.js',
		'assets/bower_components/sylvester/sylvester.src.js',
		'assets/javascripts/graph_components/class.js',
		'assets/bower_components/d3/d3.js',
		'assets/bower_components/tweenjs/src/Tween.js',
		'assets/bower_components/moment/moment.js',
		'assets/bower_components/modernizr/modernizr.js',
		'build/dashboard.js'
	])
	.pipe(concat(gulp.env.production ? 'bundle.min.js' : 'bundle.js'))
	if(gulp.env.production) {
		stream = stream.pipe(uglify())
	}
	stream.pipe(gzip())
	.pipe(gulp.dest('./build'))
});

gulp.task('default', function() {
	gulp.run('scripts');
	gulp.watch('assets/javascripts/**/*.js', function() {
		gulp.run('scripts');
	});
});