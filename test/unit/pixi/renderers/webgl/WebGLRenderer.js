describe('renderers/webgl/WebGLRenderer', function () {
    'use strict';

    var expect = chai.expect;
    var WebGLRenderer = PIXI.WebGLRenderer;

    it('Module exists', function () {
        expect(WebGLRenderer).to.be.a('function');
    });

    it('Create and destroy renderer', function () {
        var renderer = new PIXI.WebGLRenderer(400, 300, {});
        renderer.destroy();
    });
});
