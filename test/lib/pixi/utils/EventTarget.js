
function pixi_utils_EventTarget_confirm(obj) {
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

function pixi_utils_EventTarget_Event_confirm(event, obj, data) {
    var expect = chai.expect;

    expect(event).to.be.an.instanceOf(PIXI.Event);

    expect(event).to.have.property('stopped', false);
    expect(event).to.have.property('stoppedImmediate', false);

    expect(event).to.have.property('target', obj);
    expect(event).to.have.property('type', data.type || 'myevent');
    expect(event).to.have.property('data', data);
    expect(event).to.have.property('content', data);

    expect(event).to.respondTo('stopPropagation');
    expect(event).to.respondTo('stopImmediatePropagation');
}