var gulp    = require('gulp'),
    runSeq  = require('run-sequence');

gulp.task('dev', function (done) {
    runSeq('build', ['watch'], done);
});
