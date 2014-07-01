
function pixi_utils_EventTarget_like(obj) {
    var expect = chai.expect;

    //public API
    expect(obj).to.respondTo('listeners');
    expect(obj).to.respondTo('emit');
    expect(obj).to.respondTo('on');
    expect(obj).to.respondTo('once');
    expect(obj).to.respondTo('off');
    expect(obj).to.respondTo('removeAllListeners');

    //Aliased names
    expect(obj).to.respondTo('removeEventListener');
    expect(obj).to.respondTo('addEventListener');
    expect(obj).to.respondTo('dispatchEvent');
}
