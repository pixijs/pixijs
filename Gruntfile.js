module.exports = function(grunt){

	"use strict";

	var root = "src/pixi/",
		debug = "bin/pixi.dev.js",
		build = "bin/pixi.js";

	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		build : {
			all : {
				dest : debug,
				src : [
					"Pixi.js",
					"Point.js",
					"Rectangle.js",
					"DisplayObject.js",
					"DisplayObjectContainer.js",
					"Sprite.js",
					"MovieClip.js",
					"InteractionManager.js",
					"Stage.js",
					"utils/Utils.js",
					"utils/EventTarget.js",
					"utils/Matrix.js",
					"utils/Detector.js",
					"renderers/WebGLShaders.js",
					"renderers/WebGLRenderer.js",
					"renderers/WebGLBatch.js",
					"renderers/CanvasRenderer.js",
					"extras/Strip.js",
					"extras/Rope.js",
					"textures/BaseTexture.js",
					"textures/Texture.js",
					"loaders/SpriteSheetLoader.js",
					"loaders/AssetLoader.js" 
				]
			}
		},
		jshint : {
			dist : {
				src : [debug],
				options : {
						asi : true,
						smarttabs: true
				}
			}			
		},
		uglify : {
			all : {
				files : {
					"bin/pixi.js" : [ debug ]
				}
			}			
		},
		distribute : {
			examples : [
				"examples/example 1 - Basics",
				"examples/example 2 - SpriteSheet",
				"examples/example 3 - MovieClip",
				"examples/example 4 - Balls",
				"examples/example 5 - Morph",
				"examples/example 6 - Interactivity",
			]
		}

	});

	grunt.registerMultiTask(
		"build",
		"Contatenate source",
		function(){
			var compiled = "",
			name = this.data.dest,
			src = this.data.src;

			src.forEach(function(filepath){

				compiled += grunt.file.read( root + filepath );

			});

			grunt.file.write(name, compiled);

			grunt.log.writeln("File '" + name + "' created.");

		}
	)

	grunt.registerMultiTask(
		"distribute",
		"Copy built file to examples",
		function(){
			var pixi = grunt.file.read( debug );

			var dests = this.data;

			dests.forEach(function(filepath){

				grunt.file.write(filepath + "/pixi.js", pixi);

			});

			grunt.log.writeln("Pixi copied to examples.");
		}
	)

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	//grunt.registerTask("default", ["build:*:*", "jshint", "uglify"]);
	grunt.registerTask("default", ["build:*:*", "uglify", "distribute:*:*"])

}