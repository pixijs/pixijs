describe('src', function () {
    'use strict';

    var expect = chai.expect;
	var pixi = require('../../../src');

    it('Module exists', function () {
        expect(pixi)
	        .to.be.an('object');
    });
});
