var gulp    = require('gulp'),
    bundle  = require('../util/bundle');

gulp.task('scripts', function () {
    return bundle();
});
