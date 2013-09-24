
function pixi_utils_EventTarget_like(obj) {
    var expect = chai.expect;

    expect(obj).to.respondTo('addEventListener');
    expect(obj).to.respondTo('dispatchEvent');
    expect(obj).to.respondTo('removeEventListener');
}
