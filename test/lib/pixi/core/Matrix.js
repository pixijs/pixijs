
function pixi_core_Matrix_confirmNewMat3(matrix) {
    var expect = chai.expect;

    expect(matrix).to.be.an.instanceof(PIXI.Matrix);
    expect(matrix).to.not.be.empty;

    expect(matrix[1]).to.equal(0);
    expect(matrix[2]).to.equal(0);
    expect(matrix[3]).to.equal(0);
    expect(matrix[4]).to.equal(1);
    expect(matrix[5]).to.equal(0);
    expect(matrix[6]).to.equal(0);
    expect(matrix[7]).to.equal(0);
    expect(matrix[8]).to.equal(1);
}

function pixi_core_Matrix_confirmNewMat4(matrix) {
    var expect = chai.expect;

    expect(matrix).to.be.an.instanceof(PIXI.Matrix);
    expect(matrix).to.not.be.empty;

    expect(matrix[0]).to.equal(1);
    expect(matrix[1]).to.equal(0);
    expect(matrix[2]).to.equal(0);
    expect(matrix[3]).to.equal(0);
    expect(matrix[4]).to.equal(0);
    expect(matrix[5]).to.equal(1);
    expect(matrix[6]).to.equal(0);
    expect(matrix[7]).to.equal(0);
    expect(matrix[8]).to.equal(0);
    expect(matrix[9]).to.equal(0);
    expect(matrix[10]).to.equal(1);
    expect(matrix[11]).to.equal(0);
    expect(matrix[12]).to.equal(0);
    expect(matrix[13]).to.equal(0);
    expect(matrix[14]).to.equal(0);
    expect(matrix[15]).to.equal(1);
}
