
function pixi_textures_Texture_confirmNew(obj, done) {
    var expect = chai.expect;

    function confirmFrameDone() {
        pixi_core_Rectangle_confirm(obj.frame, 0, 0, obj.baseTexture.width, obj.baseTexture.height);

        expect(obj).to.have.property('width', obj.baseTexture.width);
        expect(obj).to.have.property('height', obj.baseTexture.height);
        done();
    }

    expect(obj).to.be.an.instanceof(PIXI.Texture);
    pixi_utils_EventTarget_confirm(obj);

    expect(obj).to.have.property('baseTexture')
        .and.to.be.an.instanceof(PIXI.BaseTexture);

    expect(obj).to.have.property('frame');
    if (obj.baseTexture.hasLoaded) {
        confirmFrameDone();
    } else {
        obj.on('update', confirmFrameDone);
        pixi_core_Rectangle_confirm(obj.frame, 0, 0, 1, 1);
    }
}
