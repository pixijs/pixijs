var path = require('path');

module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: path.join(__dirname, '..', '..'),

        frameworks: ['browserify', 'mocha', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            'bin/pixi.js',
            'test/lib/**/*.js',
            'test/unit/{bin,src}/**/*.js',
            // 'test/functional/**/*.js',
            {
                pattern: 'test/**/*.png',
                watched: false,
                included: false,
                served: true
            }
        ],

        // list of files to exclude
        //exclude: [],

        // use spec reporter
        // possible values: 'dots', 'progress', 'junit', 'teamcity'
        // CLI --reporters progress
        reporters: ['spec'],

        // web server port
        // CLI --port 9876
        port: 9876,

        // cli runner port
        // CLI --runner-port 9100
        runnerPort: 9100,

        // enable / disable colors in the output (reporters and logs)
        // CLI --colors --no-colors
        colors: true,

        // level of logging
        // possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
        // CLI --log-level debug
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        // CLI --auto-watch --no-auto-watch
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // CLI --browsers Chrome,Firefox,Safari
        browsers: ['Firefox'],

        // If browser does not capture in given timeout [ms], kill it
        // CLI --capture-timeout 60000
        captureTimeout: 60000,

        // report which specs are slower than 500ms
        // CLI --report-slower-than 500
        reportSlowerThan: 500,

        preprocessors : {
            'test/unit/{bin,src}/**/*.js': ['browserify']
        },

        // browserify configuration
        browserify: {
            debug: true,
            transform: ['brfs'],
            configure: function(bundle) {
                bundle.on('prebundle', function() {
                    bundle.external('pixi.js');
                });
            }
        }
    });
};
