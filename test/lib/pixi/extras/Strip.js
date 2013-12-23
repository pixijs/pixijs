
function pixi_extras_Strip_confirmNew(obj) {
    var expect = chai.expect;

    pixi_display_DisplayObjectContainer_confirmNew(obj);

    expect(obj).to.be.an.instanceof(PIXI.Strip);
    expect(obj).to.respondTo('setTexture');
    expect(obj).to.respondTo('onTextureUpdate');

    // TODO: Test properties
}
