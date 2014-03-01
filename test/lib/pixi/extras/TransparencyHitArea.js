
function pixi_extras_TransparencyHitArea_confirmNew(obj, done) {
    var expect = chai.expect;

    expect(obj).to.be.an.instanceof(PIXI.TransparencyHitArea);

    expect(obj).to.have.property('textureData');

    if (done !== undefined) done();
}

function pixi_extras_TransparencyHitArea_confirmCanvasNew(obj, done) {
    var expect = chai.expect;

    expect(obj).to.be.an.instanceof(PIXI.CanvasTransparencyHitArea);
    expect(obj).to.be.an.instanceof(PIXI.TransparencyHitArea);

    pixi_extras_TransparencyHitArea_confirmNew(obj, done);
}

function pixi_extras_TransparencyHitArea_confirmWebGLNew(obj, done) {
    var expect = chai.expect;

    expect(obj).to.be.an.instanceof(PIXI.WebGLTransparencyHitArea);
    expect(obj).to.be.an.instanceof(PIXI.TransparencyHitArea);

    pixi_extras_TransparencyHitArea_confirmNew(obj, done);
}
