var fs          = require('fs'),
    path        = require('path'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    mirror      = require('gulp-mirror'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    header      = require('gulp-header'),
    source      = require('vinyl-source-stream'),
    sourcemaps  = require('gulp-sourcemaps'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    watchify    = require('watchify'),
    handleErrors = require('../util/handleErrors'),
    headerText  = fs.readFileSync(path.join(__dirname, '..', 'header.txt'), 'utf8'),
    licenseText = fs.readFileSync(path.join(__dirname, '..', '..', 'LICENSE'), 'utf8'),
    date        = new Date();

// TODO - Concat license header to dev/prod build files.
function rebundle(devBundle) {
    if (devBundle) {
        gutil.log('Starting dev rebundle...');
    }

    var debug, min;

    debug = sourcemaps.init({loadMaps: true});
    debug.pipe(sourcemaps.write('./', {sourceRoot: './'}))
        .pipe(gulp.dest(paths.out));

    min = rename({ suffix: '.min' });
    min.pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./', {sourceRoot: './', addComment: true}))
        .pipe(gulp.dest(paths.out));

    var stream = this.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source('pixi.js'))
        .pipe(buffer())
        .pipe(header(
            headerText,
            {
                licenseText: licenseText,
                date: new Date().toISOString(),
                pkg: require('../../package.json')
            }
        ));

    if (devBundle) {
        return stream.pipe(debug).once('end', function () {
            gutil.log('Dev rebundle complete.');
        });
    }
    else {
        return stream.pipe(mirror(debug, min));
    }
}

function createBundler(args) {
    args = args || {};
    args.debug = false;
    args.standalone = 'PIXI';

    var bundle = browserify(paths.jsEntry, args),
        argv = require('minimist')(process.argv.slice(2)),
        exclude = (argv.exclude || []).concat(argv.e || []);

    if (!Array.isArray(exclude)) {
        exclude = [exclude]
    }

    for (var i = 0; i < exclude.length; ++i) {
        bundle.ignore(require.resolve('../../src/' + exclude[i]));
    }

    return bundle;
}

function watch(onUpdate) {
    var bundler = watchify(createBundler(watchify.args));

    bundler.on('update', function () {
        var bundle = rebundle.call(this, true);

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
