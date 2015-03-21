describe('renderers/webgl/WebGLShaders', function () {
    'use strict';

    var expect = chai.expect;

    it('Module members exist', function () {
       
        expect(PIXI).to.respondTo('CompileVertexShader');
        expect(PIXI).to.respondTo('CompileFragmentShader');
        expect(PIXI).to.respondTo('_CompileShader');
        expect(PIXI).to.respondTo('compileProgram');
    });
});
