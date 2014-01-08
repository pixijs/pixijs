/*global process*/
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Only load this task if we have a repo token.
    // It is required to be an ENV variable for this project.
    if (process.env.COVERALLS_REPO_TOKEN) {
        grunt.loadNpmTasks('grunt-coveralls');
    // Otherwise just show a warning message
    } else {
        grunt.registerMultiTask('coveralls', 'Mock coveralls task.', function () {
            grunt.log.error('Repo token could not be determined, not submitting.');
            grunt.log.notverbose.writeln('Use --verbose to see files that would be submitted.');
        });
    }

    grunt.loadTasks('tasks');

    var srcFiles = [
            '<%= dirs.src %>/Intro.js',
            '<%= dirs.src %>/Pixi.js',
            '<%= dirs.src %>/core/Point.js',
            '<%= dirs.src %>/core/Rectangle.js',
            '<%= dirs.src %>/core/Polygon.js',
            '<%= dirs.src %>/core/Circle.js',
            '<%= dirs.src %>/core/Ellipse.js',
            '<%= dirs.src %>/core/Matrix.js',
            '<%= dirs.src %>/display/DisplayObject.js',
            '<%= dirs.src %>/display/DisplayObjectContainer.js',
            '<%= dirs.src %>/display/Sprite.js',
            '<%= dirs.src %>/display/MovieClip.js',
            '<%= dirs.src %>/filters/FilterBlock.js',
            '<%= dirs.src %>/text/Text.js',
            '<%= dirs.src %>/text/BitmapText.js',
            '<%= dirs.src %>/InteractionManager.js',
            '<%= dirs.src %>/display/Stage.js',
            '<%= dirs.src %>/utils/Utils.js',
            '<%= dirs.src %>/utils/EventTarget.js',
            '<%= dirs.src %>/utils/Detector.js',
            '<%= dirs.src %>/utils/Polyk.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLShaderUtils.js',
            '<%= dirs.src %>/renderers/webgl/shaders/PixiShader.js',
            '<%= dirs.src %>/renderers/webgl/shaders/StripShader.js',
            '<%= dirs.src %>/renderers/webgl/shaders/PrimitiveShader.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLGraphics.js',
            '<%= dirs.src %>/renderers/webgl/WebGLRenderer.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLMaskManager.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLShaderManager.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLSpriteBatch.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLFilterManager.js',
            '<%= dirs.src %>/renderers/canvas/utils/CanvasMaskManager.js',
            '<%= dirs.src %>/renderers/canvas/utils/CanvasTinter.js',
            '<%= dirs.src %>/renderers/canvas/CanvasRenderer.js',
            '<%= dirs.src %>/renderers/canvas/CanvasGraphics.js',
            '<%= dirs.src %>/primitives/Graphics.js',
            '<%= dirs.src %>/extras/Strip.js',
            '<%= dirs.src %>/extras/Rope.js',
            '<%= dirs.src %>/extras/TilingSprite.js',
            '<%= dirs.src %>/extras/Spine.js',
            '<%= dirs.src %>/textures/BaseTexture.js',
            '<%= dirs.src %>/textures/Texture.js',
            '<%= dirs.src %>/textures/RenderTexture.js',
            '<%= dirs.src %>/loaders/AssetLoader.js',
            '<%= dirs.src %>/loaders/JsonLoader.js',
            '<%= dirs.src %>/loaders/AtlasLoader.js',
            '<%= dirs.src %>/loaders/SpriteSheetLoader.js',
            '<%= dirs.src %>/loaders/ImageLoader.js',
            '<%= dirs.src %>/loaders/BitmapFontLoader.js',
            '<%= dirs.src %>/loaders/SpineLoader.js',
            '<%= dirs.src %>/filters/AbstractFilter.js',
            '<%= dirs.src %>/filters/AlphaMaskFilter.js',
            '<%= dirs.src %>/filters/ColorMatrixFilter.js',
            '<%= dirs.src %>/filters/GrayFilter.js',
            '<%= dirs.src %>/filters/DisplacementFilter.js',
            '<%= dirs.src %>/filters/PixelateFilter.js',
            '<%= dirs.src %>/filters/BlurXFilter.js',
            '<%= dirs.src %>/filters/BlurYFilter.js',
            '<%= dirs.src %>/filters/BlurFilter.js',
            '<%= dirs.src %>/filters/InvertFilter.js',
            '<%= dirs.src %>/filters/SepiaFilter.js',
            '<%= dirs.src %>/filters/TwistFilter.js',
            '<%= dirs.src %>/filters/ColorStepFilter.js',
            '<%= dirs.src %>/filters/DotScreenFilter.js',
            '<%= dirs.src %>/filters/CrossHatchFilter.js',
            '<%= dirs.src %>/filters/RGBSplitFilter.js',
            '<%= dirs.src %>/Outro.js'
        ],
        banner = [
            '/**',
            ' * @license',
            ' * <%= pkg.name %> - v<%= pkg.version %>',
            ' * Copyright (c) 2012, Mat Groves',
            ' * <%= pkg.homepage %>',
            ' *',
            ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
            ' *',
            ' * <%= pkg.name %> is licensed under the <%= pkg.license %> License.',
            ' * <%= pkg.licenseUrl %>',
            ' */',
            ''
        ].join('\n'),
        Instrumenter = require('istanbul').Instrumenter,
        instrumenter = new Instrumenter();

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        dirs: {
            build: 'bin',
            docs: 'docs',
            src: 'src/pixi',
            test: 'test',
            coverage: 'coverage'
        },
        files: {
            srcBlob: '<%= dirs.src %>/**/*.js',
            testBlob: '<%= dirs.test %>/{functional,lib/pixi,unit/pixi}/**/*.js',
            build: '<%= dirs.build %>/pixi.dev.js',
            buildMin: '<%= dirs.build %>/pixi.js',
            buildInstrumented: '<%= dirs.coverage %>/pixi.instrumented.js'
        },
        concat: {
            options: {
                banner: banner
            },
            dist: {
                src: srcFiles,
                dest: '<%= files.build %>'
            },
            instrument: {
                options: {
                    process: function processInstrument(src, filepath) {
                        return (filepath.match(/(Intro|Outro)\.js$/) === null) ?
                            instrumenter.instrumentSync(src, filepath) : src;
                    }
                },
                src: srcFiles,
                dest: '<%= files.buildInstrumented %>'
            }
        },
        /* jshint -W106 */
        concat_sourcemap: {
            dev: {
                files: {
                    '<%= files.build %>': srcFiles
                },
                options: {
                    sourceRoot: '../'
                }
            }
        },
        coveralls: {
            coverage: {
                src: '<%= dirs.coverage %>/**/lcov.info'
            }
        },
        jshint: {
            options: {
                jshintrc: './.jshintrc'
            },
            source: srcFiles.filter(function(v) { return v.match(/(Intro|Outro|Spine|Pixi)\.js$/) === null; }).concat('Gruntfile.js'),
            test: {
                src: ['<%= files.testBlob %>'],
                options: {
                    jshintrc: undefined, //don't use jshintrc for tests
                    expr: true,
                    undef: false,
                    camelcase: false
                }
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            dist: {
                src: '<%= files.build %>',
                dest: '<%= files.buildMin %>'
            }
        },
        connect: {
            test: {
                options: {
                    port: grunt.option('port-test') || 9002,
                    base: './',
                    keepalive: true
                }
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                logo: '<%= pkg.logo %>',
                options: {
                    paths: '<%= dirs.src %>',
                    outdir: '<%= dirs.docs %>'
                }
            }
        },
        watch: {
            scripts: {
                files: ['<%= dirs.src %>/**/*.js'],
                tasks: ['concat:dist'],
                options: {
                    spawn: false,
                }
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                // browsers: ['Chrome'],
                singleRun: true
            }
        }
    });

    grunt.registerTask('default', ['build', 'test']);

    grunt.registerTask('build', ['jshint:source', 'concat:dist', 'uglify']);
    grunt.registerTask('build-debug', ['concat_sourcemap', 'uglify']);

    grunt.registerTask('test', ['jshint:test', 'concat:instrument', 'karma']);

    grunt.registerTask('docs', ['yuidoc']);
    grunt.registerTask('travis', ['build', 'test', 'coveralls']);

    grunt.registerTask('default', ['build', 'test']);
    grunt.registerTask('debug-watch', ['concat:dist', 'watch']);

};
