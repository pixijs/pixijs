describe('pixi/textures/RenderTexture', function () {
    'use strict';

    var expect = chai.expect;
    var RenderTexture = PIXI.RenderTexture;

    it('Module exists', function () {
        expect(RenderTexture).to.be.a('function');
    });

    it('Confirm new instance', function (done) {
        var texture = new RenderTexture(100, 100, new PIXI.CanvasRenderer());
        pixi_textures_RenderTexture_confirmNew(texture, done);
    });
});
