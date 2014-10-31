describe('renderers/webgl/WebGLRenderer', function () {
    'use strict';

    var expect = chai.expect;
    var WebGLRenderer = PIXI.WebGLRenderer;

    it('Module exists', function () {
        expect(WebGLRenderer).to.be.a('function');
    });

    it('Destroy renderer', function () {
        var renderer;
        try {
            renderer = new PIXI.WebGLRenderer(400, 300, {});
        } catch (error) {
            // Cannot test destroy method if we cannot create WebGLRenderer
        }
        renderer.destroy();
    });
});
