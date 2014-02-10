function pixi_core_Matrix_confirmNewMatrix(matrix) {
    var expect = chai.expect;

    expect(matrix).to.be.an.instanceof(PIXI.Matrix);
    expect(matrix).to.not.be.empty;

    expect(matrix.a).to.equal(1);
    expect(matrix.b).to.equal(0);
    expect(matrix.c).to.equal(0);
    expect(matrix.d).to.equal(1);
    expect(matrix.tx).to.equal(0);
    expect(matrix.ty).to.equal(0);
}