describe('pixi/extras/TilingSprite', function () {
    'use strict';

    var expect = chai.expect;
    var TilingSprite = PIXI.TilingSprite;
    var Texture = PIXI.Texture;

    it('Module exists', function () {
        expect(TilingSprite).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var texture = Texture.fromImage('/base/test/textures/bunny.png');
        var obj = new TilingSprite(texture, 6000, 12000);

        pixi_display_DisplayObjectContainer_confirmNew(obj);

        expect(obj).to.be.an.instanceof(TilingSprite);
        expect(obj).to.respondTo('setTexture');
        expect(obj).to.respondTo('onTextureUpdate');

        // TODO: Test properties
    });
});
