
function pixi_core_Point_confirm(obj, x, y) {
    var expect = chai.expect;

    expect(obj).to.be.an.instanceof(PIXI.Point);
    expect(obj).to.respondTo('clone');

    expect(obj).to.have.property('x', x);
    expect(obj).to.have.property('y', y);
}
