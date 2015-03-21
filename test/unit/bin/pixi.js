describe('bin/pixi.js', function () {
    'use strict';

    var expect = chai.expect;

    it('Standalone PIXI exists', function () {
        expect(PIXI).
            to.be.an('object');
    });

    // TODO: This does not actually work with
    // Browserify standalone option is use.
    // This options wraps bundle in a closure
    // and prevents the require function and
    // hence the pixi.js module from being exposed.
    // it('Module exists', function () {
    //     expect(require('pixi.js')).
    //         to.be.an('object');
    // });
});
