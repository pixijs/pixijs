var path        = require('path'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    watchify    = require('watchify'),
    handleErrors = require('../util/handleErrors');

// TODO - Concat license header to dev/prod build files.
function rebundle() {
    return this.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source('pixi.js'))
        .pipe(gulp.dest(paths.out))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.out));
}

function createBundler(args) {
    args = args || {};
    args.debug = true;
    args.standalone = 'PIXI';

    return browserify(paths.jsEntry, args);
}

function watch(onUpdate) {
    var bundler = watchify(createBundler(watchify.args));

    if (onUpdate) {
        bundler.on('update', function () {
            rebundle.call(this).on('end', onUpdate);
        });
    }

    return rebundle.call(bundler);
}

module.exports = function bundle() {
    return rebundle.call(createBundler());
};

module.exports.watch = watch;
module.exports.rebundle = rebundle;
module.exports.createBundler = createBundler;
