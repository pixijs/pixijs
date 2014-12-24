var path        = require('path'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    source      = require('vinyl-source-stream'),
    browserify  = require('browserify'),
    watchify    = require('watchify'),
    handleErrors = require('../util/handleErrors');

function rebundle() {
    return this.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source('main.js'))
        .pipe(gulp.dest(paths.out));
}

function createBundler(args, debug) {
    args = args || {};
    args.debug = debug;
    args.standalone = 'PIXI';

    return browserify(paths.jsEntry, args);
}

function watch(onUpdate, debug) {
    var bundler = watchify(createBundler(watchify.args, debug));

    bundler.on('update', function () {
        rebundle.call(this).on('end', onUpdate);
    });

    return rebundle.call(bundler);
}

module.exports = function bundle(debug) {
    return rebundle.call(createBundler(null, debug));
};

module.exports.watch = watch;
module.exports.rebundle = rebundle;
module.exports.createBundler = createBundler;
