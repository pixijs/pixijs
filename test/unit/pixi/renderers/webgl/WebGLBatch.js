describe('renderers/webgl/WebGLBatch', function () {
    'use strict';

    var expect = chai.expect;
    var WebGLBatch = PIXI.WebGLBatch;

    it('Module exists', function () {
        expect(WebGLBatch).to.be.a('function');
    });
});
