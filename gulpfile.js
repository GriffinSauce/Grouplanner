var gulp = require('gulp');
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');

gulp.task('sass', function () {
	gulp.src('./sass/grouplanner.scss')
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('./www/css'))
		.pipe(livereload());
});

gulp.task('watch', function () {
	livereload.listen();
	gulp.watch('sass/**/*.scss', ['sass']);
});

gulp.task('default', ['watch']);
