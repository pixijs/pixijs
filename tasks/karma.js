module.exports = function (grunt) {
    'use strict';

    var path   = require('path');
    var server = require('karma').server;

    grunt.registerMultiTask('karma', 'run karma.', function(target) {
        //merge data onto options, with data taking precedence
        var options = grunt.util._.merge(this.options(), this.data),
            done = this.async();

        if (options.configFile) {
            options.configFile = grunt.template.process(options.configFile);
            options.configFile = path.resolve(options.configFile);
        }

        done = this.async();
        server.start(options, function(code) {
            done(!code);
        });
    });
};
