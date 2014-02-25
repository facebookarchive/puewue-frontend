/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var gulpif = require('gulp-if');
var es = require('event-stream');
var clean = require('gulp-clean');

gulp.task('check', function() {
	gulp.src(['lib/javascripts/**', '!lib/javascripts/graph_components/class.js'])
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
});

gulp.task('dashboard', function() {
	var stream = gulp.src(['lib/javascripts/power_dashboard.js'])
	.pipe(browserify({
		insertGlobals : true,
		debug : false
	}))
	.pipe(concat('dashboard.js'))
	.pipe(gulp.dest('./tmp'))
	return stream;
});

gulp.task('sass', function () {
	var sassOpts = {includePaths: [require('node-bourbon').includePaths, './lib/stylesheets']};
	if(gulp.env.production) sassOpts.outputStyle = 'compressed';
	gulp.src(['./lib/stylesheets/application.scss'])
	.pipe(sass(sassOpts))
	.pipe(concat(gulp.env.production ? 'dashboard.min.css' : 'dashboard.css'))
	.pipe(gulp.dest('./build'));
});

gulp.task('images', function() {
	return gulp.src(['./lib/stylesheets/sprite.png'])
	.pipe(gulp.dest('./build'))
});

gulp.task('scripts', ['dashboard'], function() {
	var stream = gulp.src([
		'bower_components/underscore/underscore.js',
		'bower_components/backbone/backbone.js',
		'bower_components/jquery-tiny-pubsub/dist/ba-tiny-pubsub.js',
		'bower_components/json2/json2.js',
		'bower_components/sylvester/sylvester.src.js',
		'bower_components/d3/d3.js',
		'bower_components/tweenjs/src/Tween.js',
		'bower_components/moment/moment.js',
		'bower_components/modernizr/modernizr.js',
		'lib/javascripts/graph_components/class.js',
		'tmp/dashboard.js'
	])
	.pipe(concat(gulp.env.production ? 'dashboard.min.js' : 'dashboard.js'))
	.pipe(gulpif(gulp.env.production, uglify()))
	.pipe(gulp.dest('./build'));
	return stream;
});

gulp.task('scripts-with-cleanup', ['scripts'], function() {
	gulp.src(['./tmp/*.js'])
	.pipe(clean({force: true}))
});

gulp.task('default', function() {
	gulp.run('check');
	gulp.run('sass');
	gulp.run('images');
	gulp.run('scripts-with-cleanup');
});

gulp.task('watch', function() {
	gulp.watch([
		'lib/javascripts/**/*.js',
		'lib/stylesheets/**/*.scss',
		'lib/stylesheets.sprite.png'
	], function() {
		gulp.run('scripts-with-cleanup');
	});
});
