var gulp    = require('gulp'),
    runSeq  = require('run-sequence');

gulp.task('dev', function (done) {
    global.isDev = true;
    runSeq('build', ['watch'], done);
});
