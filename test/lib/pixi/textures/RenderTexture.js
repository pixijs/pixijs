
function pixi_textures_RenderTexture_confirmNew(obj, done) {
    var expect = chai.expect;

    expect(obj).to.have.property('width');
    expect(obj).to.have.property('height');

    expect(obj).to.have.property('render');
    expect(obj).to.have.property('renderer');
    // expect(obj).to.have.property('projection');
    expect(obj).to.have.property('textureBuffer');

    pixi_textures_Texture_confirmNew(obj, done);
}
