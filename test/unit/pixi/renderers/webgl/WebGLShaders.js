describe('renderers/webgl/WebGLShaders', function () {
    'use strict';

    var expect = chai.expect;

    it('Module members exist', function () {
        expect(PIXI).to.respondTo('initDefaultShaders');

        expect(PIXI).to.respondTo('activatePrimitiveShader');
        expect(PIXI).to.respondTo('deactivatePrimitiveShader');

        expect(PIXI).to.respondTo('activateStripShader');
        expect(PIXI).to.respondTo('deactivateStripShader');

        expect(PIXI).to.respondTo('CompileVertexShader');
        expect(PIXI).to.respondTo('CompileFragmentShader');
        expect(PIXI).to.respondTo('_CompileShader');
        expect(PIXI).to.respondTo('compileProgram');
    });
});
