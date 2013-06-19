module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    var root = 'src/pixi/',
        debug = 'bin/pixi.dev.js',
        srcFiles = [
            '<%= dirs.src %>/Intro.js',
            '<%= dirs.src %>/Pixi.js',
            '<%= dirs.src %>/Point.js',
            '<%= dirs.src %>/Rectangle.js',
            '<%= dirs.src %>/Polygon.js',
            '<%= dirs.src %>/DisplayObject.js',
            '<%= dirs.src %>/DisplayObjectContainer.js',
            '<%= dirs.src %>/Sprite.js',
            '<%= dirs.src %>/MovieClip.js',
            '<%= dirs.src %>/text/Text.js',
            '<%= dirs.src %>/text/BitmapText.js',
            '<%= dirs.src %>/Text.js',
            '<%= dirs.src %>/InteractionManager.js',
            '<%= dirs.src %>/Stage.js',
            '<%= dirs.src %>/utils/Utils.js',
            '<%= dirs.src %>/utils/EventTarget.js',
            '<%= dirs.src %>/utils/Matrix.js',
            '<%= dirs.src %>/utils/Detector.js',
            '<%= dirs.src %>/renderers/WebGLShaders.js',
            '<%= dirs.src %>/renderers/WebGLRenderer.js',
            '<%= dirs.src %>/renderers/WebGLBatch.js',
            '<%= dirs.src %>/renderers/WebGLRenderGroup.js',
            '<%= dirs.src %>/renderers/CanvasRenderer.js',
            '<%= dirs.src %>/extras/Strip.js',
            '<%= dirs.src %>/extras/Rope.js',
            '<%= dirs.src %>/extras/TilingSprite.js',
            '<%= dirs.src %>/extras/Spine.js',
            '<%= dirs.src %>/extras/CustomRenderable.js',
            '<%= dirs.src %>/textures/BaseTexture.js',
            '<%= dirs.src %>/textures/Texture.js',
            '<%= dirs.src %>/textures/RenderTexture.js',
            '<%= dirs.src %>/loaders/AssetLoader.js',
            '<%= dirs.src %>/loaders/JsonLoader.js',
            '<%= dirs.src %>/loaders/SpriteSheetLoader.js',
            '<%= dirs.src %>/loaders/ImageLoader.js',
            '<%= dirs.src %>/loaders/BitmapFontLoader.js',
            '<%= dirs.src %>/loaders/SpineLoader.js',
            '<%= dirs.src %>/Outro.js'
        ], banner = [
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
        ].join('\n');

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        dirs: {
            build: 'bin',
            docs: 'docs',
            examples: 'examples',
            src: 'src/pixi',
            test: 'test'
        },
        files: {
            srcBlob: '<%= dirs.src %>/**/*.js',
            testBlob: '<%= dirs.test %>/unit/**/*.js',
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
        jshint: {
            beforeconcat: srcFiles,
            test: ['<%= files.testBlob %>'],
            options: {
                asi: true,
                smarttabs: true
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
        distribute: {
            examples: [
                'examples/example 1 - Basics',
                'examples/example 2 - SpriteSheet',
                'examples/example 3 - MovieClip',
                'examples/example 4 - Balls',
                'examples/example 5 - Morph',
                'examples/example 6 - Interactivity',
                'examples/example 7 - Transparent Background',
                'examples/example 8 - Dragging',
                'examples/example 9 - Tiling Texture',
                'examples/example 10 - Text',
                'examples/example 11 - RenderTexture',
                'examples/example 12 - Spine'
            ]
        },
        connect: {
            qunit: {
                options: {
                    port: grunt.option('port-test') || 9002,
                    base: './'
                }
            },
            test: {
                options: {
                    port: grunt.option('port-test') || 9002,
                    base: './',
                    keepalive: true
                }
            }
        },
        qunit: {
            all: {
                options: {
                    urls: ['http://localhost:' + (grunt.option('port-test') || 9002) + '/test/index.html']
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
        }
    });

    grunt.registerMultiTask(
        'distribute',
        'Copy built file to examples',
        function(){
            var pixi = grunt.file.read( debug );

            var dests = this.data;

            dests.forEach(function(filepath){

                grunt.file.write(filepath + '/pixi.js', pixi);

            });

            grunt.log.writeln('Pixi copied to examples.');
        }
    )

    grunt.registerTask('default', ['concat', 'uglify', 'distribute']);
    grunt.registerTask('build', ['concat', 'uglify', 'distribute']);
    grunt.registerTask('test', ['build', 'connect:qunit', 'qunit']);
    grunt.registerTask('docs', ['yuidoc']);

}