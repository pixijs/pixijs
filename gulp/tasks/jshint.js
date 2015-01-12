var gulp        = require('gulp'),
    jshint      = require('gulp-jshint'),
    cache       = require('gulp-cached'),
    handleErrors = require('../util/handleErrors');

gulp.task('jshint', function () {
    return gulp.src(paths.scripts)
        .pipe(handleErrors())
        .pipe(cache('jshint', { optimizeMemory: true }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-summary'));
});
