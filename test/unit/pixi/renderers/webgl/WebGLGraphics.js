describe('renderers/wegbl/WebGLGraphics', function () {
    'use strict';

    var expect = chai.expect;
    var WebGLGraphics = PIXI.WebGLGraphics;

    it('Module exists', function () {
        expect(WebGLGraphics).to.be.a('function');
    });

    it('Members exist', function () {
        expect(WebGLGraphics).itself.to.respondTo('renderGraphics');
        expect(WebGLGraphics).itself.to.respondTo('updateGraphics');
        expect(WebGLGraphics).itself.to.respondTo('buildRectangle');
        expect(WebGLGraphics).itself.to.respondTo('buildRoundedRectangle');
        expect(WebGLGraphics).itself.to.respondTo('buildCircle');
        expect(WebGLGraphics).itself.to.respondTo('buildLine');
        expect(WebGLGraphics).itself.to.respondTo('buildPoly');
    });
});
