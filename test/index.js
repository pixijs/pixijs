require('../bin/pixi');

describe('PIXI', function () {
    it('should exist as a global object', function () {
        expect(PIXI).to.be.an('object');
    });
    require('./core');
    require('./interaction');
});