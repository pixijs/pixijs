module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
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
            '<%= dirs.src %>/display/SpriteBatch.js',
            '<%= dirs.src %>/display/MovieClip.js',
            '<%= dirs.src %>/filters/FilterBlock.js',
            '<%= dirs.src %>/text/Text.js',
            '<%= dirs.src %>/text/BitmapText.js',
            '<%= dirs.src %>/InteractionData.js',
            '<%= dirs.src %>/InteractionManager.js',
            '<%= dirs.src %>/display/Stage.js',
            '<%= dirs.src %>/utils/Utils.js',
            '<%= dirs.src %>/utils/EventTarget.js',
            '<%= dirs.src %>/utils/Detector.js',
            '<%= dirs.src %>/utils/Polyk.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLShaderUtils.js',
            '<%= dirs.src %>/renderers/webgl/shaders/PixiShader.js',
            '<%= dirs.src %>/renderers/webgl/shaders/PixiFastShader.js',
            '<%= dirs.src %>/renderers/webgl/shaders/StripShader.js',
            '<%= dirs.src %>/renderers/webgl/shaders/PrimitiveShader.js',
            '<%= dirs.src %>/renderers/webgl/shaders/ComplexPrimitiveShader.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLGraphics.js',
            '<%= dirs.src %>/renderers/webgl/WebGLRenderer.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLBlendModeManager.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLMaskManager.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLStencilManager.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLShaderManager.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLSpriteBatch.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLFastSpriteBatch.js',
            '<%= dirs.src %>/renderers/webgl/utils/WebGLFilterManager.js',
			'<%= dirs.src %>/renderers/webgl/utils/FilterTexture.js',
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
            ' * Copyright (c) 2012-2014, Mat Groves',
            ' * <%= pkg.homepage %>',
            ' *',
            ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
            ' *',
            ' * <%= pkg.name %> is licensed under the <%= pkg.license %> License.',
            ' * <%= pkg.licenseUrl %>',
            ' */',
            ''
        ].join('\n');

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
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
        },
        concat: {
            options: {
                banner: banner
            },
            dist: {
                src: srcFiles,
                dest: '<%= files.build %>'
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
        jshint: {
            options: {
                jshintrc: './.jshintrc'
            },
            source: {
                src: srcFiles.concat('Gruntfile.js'),
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
        //Watches and builds for _development_ (source maps)
        watch: {
            scripts: {
                files: ['<%= dirs.src %>/**/*.js'],
                tasks: ['concat_sourcemap'],
                options: {
                    spawn: false,
                }
            }
        },
        karma: {
            unit: {
                configFile: '<%= files.testConf %>',
                // browsers: ['Chrome'],
                singleRun: true
            }
        }
    });

    grunt.registerTask('default', ['build', 'test']);

    grunt.registerTask('build', ['jshint:source', 'concat', 'uglify']);
    grunt.registerTask('build-debug', ['concat_sourcemap', 'uglify']);

    grunt.registerTask('test', ['concat', 'jshint:test', 'karma']);

    grunt.registerTask('docs', ['yuidoc']);
    grunt.registerTask('travis', ['build', 'test']);

    grunt.registerTask('default', ['build', 'test']);
    
    grunt.registerTask('debug-watch', ['concat_sourcemap', 'watch:debug']);
};
