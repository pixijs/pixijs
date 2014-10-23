
function pixi_display_DisplayObjectContainer_confirmNew(obj) {
    var expect = chai.expect;

    pixi_display_DisplayObject_confirmNew(obj);

    expect(obj).to.be.an.instanceof(PIXI.DisplayObjectContainer);
    expect(obj).to.respondTo('addChild');
    expect(obj).to.respondTo('addChildAt');
    expect(obj).to.respondTo('swapChildren');
    expect(obj).to.respondTo('getChildAt');
    expect(obj).to.respondTo('getChildIndex');
    expect(obj).to.respondTo('setChildIndex');
    expect(obj).to.respondTo('removeChild');
    expect(obj).to.respondTo('updateTransform');

    expect(obj).to.have.deep.property('children.length', 0);
}
