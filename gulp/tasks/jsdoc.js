var gulp = require('gulp'),
    exec = require('child_process').exec;

gulp.task('jsdoc', function (done) {
    exec('npm docs', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        done(err);
    });
});
