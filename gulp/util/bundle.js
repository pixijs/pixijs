var path        = require('path'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    watchify    = require('watchify'),
    exorcist    = require('exorcist'),
    handleErrors = require('../util/handleErrors');

// TODO - Concat license header to dev/prod build files.
function rebundle() {
    return this.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(exorcist(paths.out + '/pixi.js.map'))
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

    var bundle = browserify(paths.jsEntry, args),
        argv = require('minimist')(process.argv.slice(2)),
        exclude = (argv.exclude || []).concat(argv.e || []);

    for (var i = 0; i < exclude.length; ++i) {
        bundle.ignore('./' + exclude[i]);
    }

    bundle.require(paths.jsEntry, { expose: 'pixi.js' });

    return bundle;
}

function watch(onUpdate) {
    var bundler = watchify(createBundler(watchify.args));

    bundler.on('update', function () {
        var bundle = rebundle.call(this);

        if (onUpdate) {
            bundle.on('end', onUpdate);
        }
    });

    return rebundle.call(bundler);
}

module.exports = function bundle() {
    return rebundle.call(createBundler());
};

module.exports.watch = watch;
module.exports.rebundle = rebundle;
module.exports.createBundler = createBundler;
