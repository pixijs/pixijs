describe('bin/pixi.js', function () {
    'use strict';

    var expect = chai.expect;

    it('Standalone PIXI exists', function () {
        expect(PIXI).
            to.be.an('object');
    });

    /**
     * @todo This does not actually work with Browserify
     *       option in use. The standalone option wraps
     *       the bundle in a UMD closure and prevents
     *       the `require` function, and consequently
     *       the "pixi.js" module, from being exposed.
     */
    //it('Module exists', function () {
    //    expect(require('pixi.js')).
    //        to.be.an('object');
    //});
});
