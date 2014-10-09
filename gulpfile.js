var gulp = require('gulp');
var sass = require('gulp-sass')

gulp.task('sass', function () {
    gulp.src('./sass/grouplanner.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css'));
});

gulp.task('watch', function () {
	gulp.watch('sass/**/*.scss', ['sass']);
});

gulp.task('default', ['watch']);