describe('pixi/display/Sprite', function () {
    'use strict';

    var expect = chai.expect;
    var Sprite = PIXI.Sprite;
    var Texture = PIXI.Texture;

    it('Module exists', function () {
        expect(Sprite).to.be.a('function');
        expect(PIXI).to.have.deep.property('blendModes.NORMAL', 0);
        expect(PIXI).to.have.deep.property('blendModes.ADD', 1);
        expect(PIXI).to.have.deep.property('blendModes.MULTIPLY', 2);
        expect(PIXI).to.have.deep.property('blendModes.SCREEN', 3);
    });


    it('Members exist',  function () {
        expect(Sprite).itself.to.respondTo('fromImage');
        expect(Sprite).itself.to.respondTo('fromFrame');
    });

    it('Confirm new instance', function (done) {
        var texture = Texture.fromImage('/base/test/textures/SpriteSheet-Aliens.png');
        var obj = new Sprite(texture);

        pixi_display_Sprite_confirmNew(obj, done);
    });
});
