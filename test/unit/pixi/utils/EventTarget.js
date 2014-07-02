describe('pixi/utils/EventTarget', function () {
    'use strict';

    var expect = chai.expect;

    var Clazz, PClazz, obj, pobj, obj2;
    beforeEach(function () {
        Clazz = function () {};
        PClazz = function () {};

        PIXI.EventTarget.mixin(Clazz.prototype);
        PIXI.EventTarget.mixin(PClazz.prototype);

        obj = new Clazz();
        obj2 = new Clazz();
        pobj = new PClazz();

        obj.parent = pobj;
        obj2.parent = obj;
    });

    it('Module exists', function () {
        expect(PIXI.EventTarget).to.be.an('object');
    });

    it('Confirm new instance', function () {
        pixi_utils_EventTarget_like(obj);
    });

    it('simple on/emit case works', function (done) {
        var myData = {};

        obj.on('myevent', function (event) {
            expect(event).to.be.an.instanceOf(PIXI.Event);

            expect(event).to.have.property('stopped', false);
            expect(event).to.have.property('stoppedImmediate', false);

            expect(event).to.have.property('target', obj);
            expect(event).to.have.property('type', 'myevent');
            expect(event).to.have.property('data', myData);

            expect(event).to.respondTo('stopPropagation');
            expect(event).to.respondTo('stopImmediatePropagation');

            done();
        });

        obj.emit('myevent', myData);
    });

    it('simple once case works', function () {
        var called = 0;

        obj.once('myevent', function() { called++; });

        obj.emit('myevent');
        obj.emit('myevent');
        obj.emit('myevent');
        obj.emit('myevent');
        obj.emit('myevent');

        expect(called).to.equal(1);
    });

    it('simple off case works', function (done) {
        function onMyEvent() {
            done(new Error('Event listener should not have been called'));
        }

        obj.on('myevent', onMyEvent);
        obj.off('myevent', onMyEvent);
        obj.emit('myevent');

        done();
    });

    it('simple propagation case works', function (done) {
        var myData = {};

        pobj.on('myevent', function () {
            done();
        });

        obj.emit('myevent');
    });

    it('simple stopPropagation case works', function (done) {
        var myData = {};

        pobj.on('myevent', function () {
            done(new Error('Event listener should not have been called on the parent element'));
        });

        obj.on('myevent', function (evt) {
            evt.stopPropagation();
        });

        obj.emit('myevent');

        done();
    });

    it('simple stopImmediatePropagation case works', function (done) {
        var myData = {};

        pobj.on('myevent', function () {
            done(new Error('Event listener should not have been called on the parent'));
        });

        obj.on('myevent', function (evt) {
            evt.stopImmediatePropagation();
        });

        obj.on('myevent', function () {
            done(new Error('Event listener should not have been called on the second'));
        });

        obj.emit('myevent');

        done();
    });

    it('multiple dispatches work properly', function () {
        var called = 0;

        function onMyEvent() {
            called++;
        }

        obj.on('myevent', onMyEvent);
        obj.emit('myevent');
        obj.emit('myevent');
        obj.emit('myevent');
        obj.emit('myevent');

        expect(called).to.equal(4);
    });

    it('multiple events work properly', function () {
        var called = 0;

        function onMyEvent() {
            called++;
        }

        obj.on('myevent1', onMyEvent);
        obj.on('myevent2', onMyEvent);
        obj.on('myevent3', onMyEvent);
        obj.emit('myevent1');
        obj.emit('myevent2');
        obj.emit('myevent3');

        expect(called).to.equal(3);
    });

    it('multiple events one removed works properly', function () {
        var called = 0;

        function onMyEvent() {
            called++;
        }

        obj.on('myevent1', onMyEvent);
        obj.on('myevent2', onMyEvent);
        obj.on('myevent3', onMyEvent);

        obj.emit('myevent1');
        obj.emit('myevent2');
        obj.emit('myevent3');

        obj.off('myevent2', onMyEvent);

        obj.emit('myevent1');
        obj.emit('myevent2');
        obj.emit('myevent3');

        expect(called).to.equal(5);
    });

    it('handles multiple instances with the same prototype', function () {
        var called = 0;

        function onMyEvent(e) {
            console.log(e.type, this.istwo, this._listeners[e.type]);
            called++;
        }

        obj.on('myevent1', onMyEvent);
        obj.on('myevent2', onMyEvent);

        obj2.istwo = true;
        obj2.on('myevent1', onMyEvent);
        obj2.on('myevent2', onMyEvent);

        obj.emit('myevent1');
        obj.emit('myevent2');
        obj2.emit('myevent1');
        obj2.emit('myevent2');

        expect(called).to.equal(4);
    });

    it('is backwards compatible with older dispatchEvent', function () {
        var called = 0;

        function onMyEvent() {
            called++;
        }

        obj.on('myevent1', onMyEvent);
        obj.on('myevent2', onMyEvent);
        obj.on('myevent3', onMyEvent);

        obj.emit({ type: 'myevent1' });
        obj.emit({ type: 'myevent2' });
        obj.emit({ type: 'myevent3' });

        obj.off('myevent2', onMyEvent);

        obj.emit({ type: 'myevent1' });
        obj.emit({ type: 'myevent2' });
        obj.emit({ type: 'myevent3' });

        expect(called).to.equal(5);
    });

    it('is backwards compatible with older .call(this)', function () {

    });
});
