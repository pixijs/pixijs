describe('pixi/core/Matrix', function () {
    'use strict';

    var expect = chai.expect;

    it('Matrix exists', function () {
        expect(PIXI.Matrix).to.be.an('function');
    });

    it('Confirm new Matrix', function () {
        var matrix = new PIXI.Matrix();
        pixi_core_Matrix_confirmNewMatrix(matrix);
    });
});
