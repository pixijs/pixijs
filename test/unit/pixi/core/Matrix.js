describe('pixi/core/Matrix', function () {
    'use strict';

    var expect = chai.expect;
    var mat3 = PIXI.mat3;
    var Matrix = PIXI.Matrix;
    var identityMatrix = PIXI.identityMatrix;

    it('Ensure determineMatrixArrayType works', function () {
        expect(Matrix).to.be.a('function');
    });

    it('mat3 exists', function () {
        expect(mat3).to.be.an('object');
    });

    it('Confirm new mat3 matrix', function () {
        var matrix = new mat3.create();
        pixi_core_Matrix_confirmNewMat3(matrix);
    });

    it('Confirm identityMatrix', function () {
        pixi_core_Matrix_confirmNewMat3(identityMatrix);
    });

    it('mat3 transpose', function () {
        var m = mat3.create();
        mat3.transpose(m);
        // TODO: Test without defaults
        pixi_core_Matrix_confirmNewMat3(m);
    });

    it('mat3 multiply', function () {
        var m = mat3.create();
        var m2 = mat3.create();
        var mult = mat3.multiply(m, m2);
        // TODO: Test without defaults
        pixi_core_Matrix_confirmNewMat3(mult);
    });

    it('mat3 clone', function () {
        var m = mat3.create();
        var clone = mat3.clone(m);
        expect(clone === m).to.be.false;
        // TODO: Test without defaults
        pixi_core_Matrix_confirmNewMat3(m);
        pixi_core_Matrix_confirmNewMat3(clone);
    });

    // FIXME:
    // PIXI.mat3.toMat4 is not used, not testing
    // PIXI.mat4 is not used, not testing
});
