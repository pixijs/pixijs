describe('pixi/utils/EventTarget', function () {
    'use strict';

    var expect = chai.expect;
    var EventTarget = PIXI.EventTarget;

    it('Module exists', function () {
        expect(EventTarget).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = {};

        EventTarget.call(obj);
        pixi_utils_EventTarget_like(obj);
    });

    it('addEventListener and dispatchEvent works', function (done) {
        var myData = {},
            obj = {};

        EventTarget.call(obj);

        obj.addEventListener('myevent', function (event) {
            expect(event).to.be.an('object');
            expect(event).to.have.property('type', 'myevent');
            expect(event).to.have.property('data', myData);
            done();
        });

        obj.dispatchEvent({type: 'myevent', data: myData});
    });

    it('removeEventListener works', function (done) {
        var obj = {};

        EventTarget.call(obj);

        function onMyEvent() {
            done(new Error('addEventListener should not have been called'));
        }

        obj.addEventListener('myevent', onMyEvent);
        obj.removeEventListener('myevent', onMyEvent);
        obj.dispatchEvent({type: 'myevent'});
        done();
    });

    it('multiple dispatches', function () {
        var called = 0,
            obj = {};

        EventTarget.call(obj);

        function onMyEvent() {
            called++;
        }

        obj.addEventListener('myevent', onMyEvent);
        obj.dispatchEvent({type: 'myevent'});
        obj.dispatchEvent({type: 'myevent'});
        obj.dispatchEvent({type: 'myevent'});
        obj.dispatchEvent({type: 'myevent'});
        expect(called).to.equal(4);
    });

    it('multiple events', function () {
        var called = 0,
            obj = {};

        EventTarget.call(obj);

        function onMyEvent() {
            called++;
        }

        obj.addEventListener('myevent1', onMyEvent);
        obj.addEventListener('myevent2', onMyEvent);
        obj.addEventListener('myevent3', onMyEvent);
        obj.dispatchEvent({type: 'myevent1'});
        obj.dispatchEvent({type: 'myevent2'});
        obj.dispatchEvent({type: 'myevent3'});
        expect(called).to.equal(3);
    });

    it('multiple events one removed', function () {
        var called = 0,
            obj = {};

        EventTarget.call(obj);

        function onMyEvent() {
            called++;
        }

        obj.addEventListener('myevent1', onMyEvent);
        obj.addEventListener('myevent2', onMyEvent);
        obj.addEventListener('myevent3', onMyEvent);
        obj.dispatchEvent({type: 'myevent1'});
        obj.dispatchEvent({type: 'myevent2'});
        obj.dispatchEvent({type: 'myevent3'});
        obj.removeEventListener('myevent2', onMyEvent);
        obj.dispatchEvent({type: 'myevent1'});
        obj.dispatchEvent({type: 'myevent2'});
        obj.dispatchEvent({type: 'myevent3'});
        expect(called).to.equal(5);
    });
});
