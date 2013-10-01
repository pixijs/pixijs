describe('pixi/loaders/AssetLoader', function () {
    'use strict';

    var expect = chai.expect;
    var AssetLoader = PIXI.AssetLoader;

    it('Module exists', function () {
        expect(AssetLoader).to.be.a('function');
    });
});
