module.exports = {
    options: {
        jshintrc: './.jshintrc'
    },
    source: {
        src: require('../src_files'),
        options: {
            ignores: '<%= dirs.src %>/**/{Intro,Outro,Spine,Pixi}.js'
        }
    },
    test: {
        src: ['<%= files.testBlob %>'],
        options: {
            ignores: '<%= dirs.test %>/lib/resemble.js',
            jshintrc: undefined, //don't use jshintrc for tests
            expr: true,
            undef: false,
            camelcase: false
        }
    },
    tooling: {
        src: [
            'Gruntfile.js',
            'tasks/**/*.js'
        ],
        options: { jshintrc: 'tasks/.jshintrc' }
    },
};
