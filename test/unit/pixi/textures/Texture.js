describe('pixi/textures/Texture', function () {
    'use strict';

    var expect = chai.expect;
    var Texture = PIXI.Texture;

    it('Module exists', function () {
        expect(Texture).to.be.a('function');
        expect(PIXI).to.have.property('TextureCache').and.to.be.an('object');
    });

    it('Members exist',  function () {
        expect(Texture).itself.to.respondTo('fromImage');
        expect(Texture).itself.to.respondTo('fromFrame');
        expect(Texture).itself.to.respondTo('fromCanvas');
        expect(Texture).itself.to.respondTo('addTextureToCache');
        expect(Texture).itself.to.respondTo('removeTextureFromCache');

      //  expect(Texture).itself.to.have.deep.property('frameUpdates.length', 0);
    });

    it('Confirm new instance', function (done) {
        var texture = Texture.fromImage('/base/test/textures/bunny.png');
        pixi_textures_Texture_confirmNew(texture, done);
    });
});
