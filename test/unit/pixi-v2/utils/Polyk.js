describe('pixi/utils/Polyk', function () {
    'use strict';

    var expect = chai.expect;
    var PolyK = PIXI.PolyK;

    it('Module exists', function () {
        expect(PolyK).to.be.an('object');
    });

    it('Members exist', function () {
        expect(PolyK).to.respondTo('Triangulate');
    });
});
