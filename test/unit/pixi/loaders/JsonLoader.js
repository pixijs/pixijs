describe('pixi/loaders/JsonLoader', function () {
    'use strict';

    var expect = chai.expect;
    var JsonLoader = PIXI.JsonLoader;

    it('Module exists', function () {
        expect(JsonLoader).to.be.a('function');
    });
});
