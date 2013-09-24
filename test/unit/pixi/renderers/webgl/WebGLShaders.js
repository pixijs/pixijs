describe('renderers/webgl/WebGLShaders', function () {
    'use strict';

    var expect = chai.expect;

    it('Module members exist', function () {
        expect(PIXI).to.respondTo('initPrimitiveShader');
        expect(PIXI).to.respondTo('initDefaultShader');
        expect(PIXI).to.respondTo('initDefaultStripShader');
        expect(PIXI).to.respondTo('activateDefaultShader');
        expect(PIXI).to.respondTo('activatePrimitiveShader');
    });
});
