var gulp    = require('gulp'),
    runSeq  = require('run-sequence');

gulp.task('build', function (done) {
    runSeq('clean', ['scripts'], done);
});
