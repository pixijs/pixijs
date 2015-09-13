var gulp    = require('gulp'),
    del     = require('del');

gulp.task('clean', function (done) {
    return del(paths.out, done);
});
