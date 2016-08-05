#!/usr/bin/env node

var execSync = require('child_process').execSync;
var minimist = require('minimist');
var postbundle = require('./postbundle');

// Get the commandline arguments
var args = minimist(process.argv.slice(2), {
    alias: {
        e: 'exclude'
    }
});

var exclusions = '';
var excludes = args.exclude;

// Exclude certain modules
if (excludes) {
    if (!Array.isArray(excludes)) {
        excludes = [excludes];
    }
    excludes.forEach(function(exclude){
        try {
            var mod = require.resolve('../src/' + exclude);
            exclusions += '-i ' + mod + ' ';
            console.log('> Ignoring module \'%s\'', exclude);
        }
        catch(e){
            console.log('> ERROR: Module not found for \'%s\'', exclude);
        }
    });
    console.log('');
}

// Build the debug version
execSync('browserify ' + exclusions + 'src -s PIXI -d | exorcist bin/pixi.js.map > bin/pixi.js');

// Fix the output 
postbundle('bin/pixi.js', true);

// Build the release version
execSync('browserify ' + exclusions + 'src -s PIXI -d | exorcist bin/pixi.min.js.map | uglifyjs -cm > bin/pixi.min.js');

// Fix the output 
postbundle('bin/pixi.min.js');