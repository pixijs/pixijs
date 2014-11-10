
function pixi_display_DisplayObject_confirmNew(obj) {
    var expect = chai.expect;

    expect(obj).to.be.an.instanceof(PIXI.DisplayObject);
    //expect(obj).to.respondTo('setInteractive');
    //expect(obj).to.respondTo('addFilter');
    //expect(obj).to.respondTo('removeFilter');
    expect(obj).to.respondTo('updateTransform');

    expect(obj).to.contain.property('position');
    pixi_core_Point_confirm(obj.position, 0, 0);
    expect(obj).to.contain.property('scale');
    pixi_core_Point_confirm(obj.scale, 1, 1);
    expect(obj).to.contain.property('pivot');
    pixi_core_Point_confirm(obj.pivot, 0, 0);

    expect(obj).to.have.property('rotation', 0);
    expect(obj).to.have.property('alpha', 1);
    expect(obj).to.have.property('visible', true);
    expect(obj).to.have.property('buttonMode', false);
    expect(obj).to.have.property('parent', null);
    expect(obj).to.have.property('worldAlpha', 1);

    expect(obj).to.have.property('hitArea');
    expect(obj).to.have.property('interactive'); // TODO: Have a better default value
    expect('mask' in obj).to.be.true; // TODO: Have a better default value
    expect(obj.mask).to.be.null;

    expect(obj).to.have.property('renderable');
    expect(obj).to.have.property('stage');

    expect(obj).to.have.deep.property('worldTransform');
    pixi_core_Matrix_confirmNewMatrix(obj.worldTransform);

    //expect(obj).to.have.deep.property('color.length', 0);
    //expect(obj).to.have.property('dynamic', true);
}
