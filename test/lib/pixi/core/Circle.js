function pixi_core_Circle_confirmNewCircle(obj) {
    var expect = chai.expect;

    expect(obj).to.be.an.instanceof(PIXI.Circle);
    expect(obj).to.respondTo('clone');
    expect(obj).to.respondTo('contains');
    expect(obj).to.respondTo('getBounds');

    expect(obj).to.have.property('x', 0);
    expect(obj).to.have.property('y', 0);
    expect(obj).to.have.property('radius', 0);
}

function pixi_core_Circle_isBoundedByRectangle(obj, rect) {
    var expect = chai.expect;

    expect(rect).to.have.property('x', obj.x - obj.radius);
    expect(rect).to.have.property('y', obj.y - obj.radius);

    expect(rect).to.have.property('width', obj.radius * 2);
    expect(rect).to.have.property('height', obj.radius * 2);
}
