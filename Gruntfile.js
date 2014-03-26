module.exports = function(grunt) {
    var loadConfig = require('load-grunt-config');

    loadConfig(grunt, {
        configPath: __dirname + '/tasks/options',
        config: {
            banner: grunt.file.read('tasks/banner.txt'),
            portTest: grunt.option('port-test'),
            dirs: {
                build: 'bin',
                docs: 'docs',
                src: 'src/pixi',
                test: 'test'
            },
            files: {
                srcBlob: '<%= dirs.src %>/**/*.js',
                testBlob: '<%= dirs.test %>/**/*.js',
                testConf: '<%= dirs.test %>/karma.conf.js',
                build: '<%= dirs.build %>/pixi.dev.js',
                buildMin: '<%= dirs.build %>/pixi.js'
            }
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['build', 'test']);

    grunt.registerTask('build', ['jshint:source', 'concat', 'uglify']);
    grunt.registerTask('build-debug', ['concat_sourcemap', 'uglify']);

    grunt.registerTask('test', ['concat', 'jshint:test', 'karma']);

    grunt.registerTask('docs', ['yuidoc']);
    grunt.registerTask('travis', ['default']);

    grunt.registerTask('debug-watch', ['concat_sourcemap', 'watch:debug']);
};
