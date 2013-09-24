'use strict';

var path   = require('path');
var server = require('karma').server;

module.exports = function (grunt) {
    grunt.registerMultiTask('karma', 'run karma.', function() {
        var done = this.async();
        var options = this.options({
            background: false
        });
        var data = this.data;

        //merge options onto data, with data taking precedence
        data = grunt.util._.merge(options, data);
        data.configFile = path.resolve(data.configFile);
        if (data.configFile) {
            data.configFile = grunt.template.process(data.configFile);
        }

        server.start(
            data,
            function(code) {
                done(!code);
            });
    });
};
