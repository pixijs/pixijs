describe('renderers/canvas/CanvasRenderer', function () {
    'use strict';

    var expect = chai.expect;
    var CanvasRenderer = PIXI.CanvasRenderer;

    it('Module exists', function () {
        expect(CanvasRenderer).to.be.a('function');
    });
});
