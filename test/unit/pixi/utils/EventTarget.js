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
        pixi_utils_EventTarget_confirm(obj);
    });

    it('simple on/emit case works', function () {
        var myData = {};

        obj.on('myevent', function (event) {
            pixi_utils_EventTarget_Event_confirm(event, obj, myData);
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

    it('multiple handlers for one event with some removed', function () {
        var called = 0;

        var onMyEvent = function () {
                called++;
            },
            onMyEvent2 = function () {
                called++;
            };

        // add 2 handlers and confirm they both get called
        obj.on('myevent', onMyEvent);
        obj.on('myevent', onMyEvent);
        obj.on('myevent', onMyEvent2);
        obj.on('myevent', onMyEvent2);

        obj.emit('myevent');

        expect(called).to.equal(4);

        // remove one of the handlers, emit again, then ensure 1 more call is made
        obj.off('myevent', onMyEvent);

        obj.emit('myevent');

        expect(called).to.equal(6);
    });

    it('calls to off without a handler do nothing', function () {
        var called = 0;

        var onMyEvent = function () {
            called++;
        };

        obj.on('myevent', onMyEvent);
        obj.on('myevent', onMyEvent);

        obj.emit('myevent');

        expect(called).to.equal(2);

        obj.off('myevent');

        obj.emit('myevent');

        expect(called).to.equal(4);

        obj.off('myevent', onMyEvent);

        obj.emit('myevent');

        expect(called).to.equal(4);
    });

    it('handles multiple instances with the same prototype', function () {
        var called = 0;

        function onMyEvent(e) {
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

        //we emit 4 times, but since obj2 is a child of obj the event should bubble
        //up to obj and show up there as well. So the obj2.emit() calls each increment
        //the counter twice.
        expect(called).to.equal(6);
    });

    it('is backwards compatible with older .dispatchEvent({})', function () {
        var called = 0,
            data = {
                some: 'thing',
                hello: true
            };

        function onMyEvent(event) {
            pixi_utils_EventTarget_Event_confirm(event, obj, data);

            called++;
        }

        obj.on('myevent1', onMyEvent);
        obj.on('myevent2', onMyEvent);
        obj.on('myevent3', onMyEvent);

        data.type = 'myevent1';
        obj.emit(data);

        data.type = 'myevent2';
        obj.emit(data);

        data.type = 'myevent3';
        obj.emit(data);

        obj.off('myevent2', onMyEvent);

        data.type = 'myevent1';
        obj.emit(data);

        data.type = 'myevent2';
        obj.emit(data);

        data.type = 'myevent3';
        obj.emit(data);

        expect(called).to.equal(5);
    });

    it('is backwards compatible with older .call(this)', function () {
        var Fn = function() {
                PIXI.EventTarget.call(this);
            },
            o = new Fn();

        pixi_utils_EventTarget_confirm(o);
    });

    it('is backwards compatible with older .addEventListener("")', function () {
        var called = 0,
            data = {
                some: 'thing',
                hello: true
            };

        function onMyEvent(event) {
            pixi_utils_EventTarget_Event_confirm(event, obj, data);

            called++;
        }

        obj.addEventListener('myevent1', onMyEvent);
        obj.addEventListener('myevent2', onMyEvent);
        obj.addEventListener('myevent3', onMyEvent);

        data.type = 'myevent1';
        obj.emit(data);

        data.type = 'myevent2';
        obj.emit(data);

        data.type = 'myevent3';
        obj.emit(data);

        obj.off('myevent2', onMyEvent);

        data.type = 'myevent1';
        obj.emit(data);

        data.type = 'myevent2';
        obj.emit(data);

        data.type = 'myevent3';
        obj.emit(data);

        expect(called).to.equal(5);
    });

    it('event remove during emit call properly', function () {
        var called = 0;

        function cb1() {
            called++;
            obj.off('myevent', cb1);
        }
        function cb2() {
            called++;
            obj.off('myevent', cb2);
        }
        function cb3() {
            called++;
            obj.off('myevent', cb3);
        }

        obj.on('myevent', cb1);
        obj.on('myevent', cb2);
        obj.on('myevent', cb3);
        obj.emit('myevent', '');

        expect(called).to.equal(3);
    });
});
