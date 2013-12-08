
function pixi_core_Rectangle_confirm(obj, x, y, width, height) {
    var expect = chai.expect;

    expect(obj).to.be.an.instanceof(PIXI.Rectangle);
    expect(obj).to.respondTo('clone');
    expect(obj).to.respondTo('contains');

    expect(obj).to.have.property('x', x);
    expect(obj).to.have.property('y', y);
    expect(obj).to.have.property('width', width);
    expect(obj).to.have.property('height', height);
}
