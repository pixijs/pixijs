var gulp    = require('gulp'),
    del     = require('del');

gulp.task('clean', function (done) {
    del(paths.out, done);
});
