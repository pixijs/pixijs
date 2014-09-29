describe('pixi/textures/BaseTexture', function () {
    'use strict';

    var expect = chai.expect;
    var BaseTexture = PIXI.BaseTexture;

    it('Module exists', function () {
        expect(BaseTexture).to.be.a('function');
        expect(PIXI).to.have.property('BaseTextureCache').and.to.be.an('object');
    });
});
