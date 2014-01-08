var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');

gulp.task('dashboard', function() {
	//single entry point to browserify
	gulp.src(['assets/javascripts/power_dashboard.js'])
	.pipe(browserify({
		insertGlobals : true,
		// debug : true,
		transform: ['browserify-shim'],
		BROWSERIFYSHIM_DIAGNOSTICS: 1
	}))
	.pipe(concat('dashboard.js'))
	.pipe(gulp.dest('./build'))
});

gulp.task('con', ['dashboard'], function() {
	gulp.src([
		'assets/bower_components/underscore/underscore.js',
		'assets/bower_components/backbone/backbone.js',
		'assets/bower_components/jquery-tiny-pubsub/dist/ba-tiny-pubsub.js',
		'assets/bower_components/json2/json2.js',
		'assets/bower_components/sylvester/sylvester.src.js',
		'assets/javascripts/graph_components/class.js',
		'assets/bower_components/jquery/jquery',
		'assets/bower_components/d3/d3.js',
		'assets/bower_components/tweenjs/src/Tween.js',
		'assets/bower_components/moment/moment.js',
		'build/dashboard.js'
	])
	.pipe(concat('bundle.js'))
	.pipe(gulp.dest('./build'))
});

gulp.task('default', function() {
	gulp.run('con');
	gulp.watch('assets/javascripts/**', function() {
		gulp.run('con');
	});
});