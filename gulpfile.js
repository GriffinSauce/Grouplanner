var gulp = require('gulp');
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var server = require( 'gulp-develop-server');
var plumber = require('gulp-plumber');

gulp.task('sass', function () {
	gulp.src('./app/assets/sass/app.scss')
        .pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('./app/assets/css'))
        .pipe(browserSync.stream());
});

gulp.task('watch', ['browser-sync'], function () {
	gulp.watch('./app/assets/sass/**/*.scss', ['sass']);
});

gulp.task('browser-sync', ['server:start'], function() {
    browserSync.init(null, {
        proxy: 'localhost:8085',
        files: ['client/css'],
        port: 3000,
        open: false,
        notify: true
    });
});
gulp.task( 'server:start', function(cb) {
    server.listen({
        path: 'server.js'
    }, function( error ) {
        if( ! error ){
            cb();
        }
    });
});

gulp.task('default', ['watch']);
