describe('pixi/extras/Strip', function () {
    'use strict';

    var expect = chai.expect;
    var Strip = PIXI.Strip;
    var Texture = PIXI.Texture;

    it('Module exists', function () {
        expect(Strip).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var texture = Texture.fromImage('/base/test/textures/bunny.png');
        var obj = new Strip(texture, 20, 10000);

        pixi_extras_Strip_confirmNew(obj);
    });
});
