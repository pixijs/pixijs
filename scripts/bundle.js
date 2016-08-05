#!/usr/bin/env node

var minimist = require('minimist');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var vfs = require('vinyl-fs');
var uglify = require('gulp-uglify');
var empty = require('gulp-empty');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');

// Get the commandline arguments
var args = minimist(process.argv.slice(2), {
    alias: { e: 'exclude' }
});

var bundler = browserify({
    entries: './src/',
    debug: true
});

// Get the license for the header
var license = path.join(__dirname, 'license.js');
bundler.plugin('./scripts/header.js', { file: license });

// Exclude certain modules
if (args.exclude) {
    var excludes = args.exclude;
    if (!Array.isArray(excludes)) {
        excludes = [excludes];
    }
    excludes.forEach(function(exclude){
        try {
            bundler.ignore(require.resolve('../src/' + exclude));
            console.log('> Ignoring module \'%s\'', exclude);
        }
        catch(e){
            console.log('> ERROR: Module not found for \'%s\'', exclude);
        }
    });
    console.log('');
}

function bundle(output, debug) {
    bundler.bundle()
        .pipe(source(output))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(debug ? empty() : uglify({
                mangle: true,
                preserveComments: function(node, comment) {
                    if (/\@preserve/m.test(comment.value)) {
                        return true;
                    }
                }
            }))
        .pipe(sourcemaps.write('./'))
        .pipe(vfs.dest('./bin/'));
}

// Build the bundles
bundle('pixi.js', true);
bundle('pixi.min.js', false);
