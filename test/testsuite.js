requirejs.config({
    baseUrl: '/test/unit/'
});

define(function(require) {
    var testModules = [
        'Pixi',
        'Point',
        'Rectangle',
        'DisplayObject',
        'DisplayObjectContainer',
        'Sprite',
        'MovieClip',
        'InteractionManager',
        'Stage',
        'utils/Utils',
        'utils/EventTarget',
        'utils/Matrix',
        'utils/Detector',
        'renderers/WebGLShaders',
        'renderers/WebGLRenderer',
        'renderers/WebGLBatch',
        'renderers/CanvasRenderer',
        'extras/Strip',
        'extras/Rope',
        'textures/BaseTexture',
        'textures/Texture',
        'loaders/SpriteSheetLoader',
        'loaders/AssetLoader' 
    ];

    // Resolve all testModules and then start the Test Runner.
    require(testModules, function() {
        QUnit.start();
    });
});