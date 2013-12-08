describe('renders/canvas/CanvasGraphics', function () {
    'use strict';

    var expect = chai.expect;
    var CanvasGraphics = PIXI.CanvasGraphics;

    it('Module exists', function () {
        expect(CanvasGraphics).to.be.a('function');
    });

    it('Members exist', function () {
        expect(CanvasGraphics).itself.to.respondTo('renderGraphics');
        expect(CanvasGraphics).itself.to.respondTo('renderGraphicsMask');
    });
});
