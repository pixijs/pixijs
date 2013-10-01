describe('pixi/Pixi', function () {
    'use strict';

    var expect = chai.expect;

    it('Module exists', function () {
        expect(global).to.have.property('PIXI').and.to.be.an('object');
    });
});
