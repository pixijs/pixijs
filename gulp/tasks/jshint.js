var gulp        = require('gulp'),
    jshint      = require('gulp-jshint'),
    handleErrors = require('../util/handleErrors');

gulp.task('jshint', function () {
    return gulp.src(paths.scripts)
        .pipe(handleErrors())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-summary'));
});
