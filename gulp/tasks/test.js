var path    = require('path'),
    gulp    = require('gulp'),
    karma   = require('karma').server;

gulp.task('test', function (done) {
    karma.start({
        configFile: path.join(__dirname, '..', 'util', 'karma.conf.js'),
        singleRun: true
    }, done);
});
