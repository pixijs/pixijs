describe('pixi/utils/EventTarget', function () {
    'use strict';

    var expect = chai.expect;
    var EventTarget = PIXI.EventTarget;

    it('Module exists', function () {
        expect(EventTarget).to.be.an('object');
    });

    it('Confirm new instance', function () {
        var obj = {};

        EventTarget.mixin(obj);
        pixi_utils_EventTarget_like(obj);
    });

    it('simple on/emit case works', function (done) {
        var myData = {},
            obj = {};

        EventTarget.mixin(obj);

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
        var called = 0,
            obj = {};

        EventTarget.mixin(obj);

        obj.once('myevent', function() { called++; });

        obj.emit('myevent');
        obj.emit('myevent');
        obj.emit('myevent');
        obj.emit('myevent');
        obj.emit('myevent');

        expect(called).to.equal(1);
    });

    it('simple off case works', function (done) {
        var obj = {};

        EventTarget.mixin(obj);

        function onMyEvent() {
            done(new Error('Event listener should not have been called'));
        }

        obj.on('myevent', onMyEvent);
        obj.off('myevent', onMyEvent);
        obj.emit('myevent');

        done();
    });

    it('simple propagation case works', function (done) {
        var myData = {},
            pobj = {},
            obj = { parent: pobj };

        EventTarget.mixin(pobj);
        EventTarget.mixin(obj);

        pobj.on('myevent', function () {
            done();
        });

        obj.emit('myevent');
    });

    it('simple stopPropagation case works', function (done) {
        var myData = {},
            pobj = {},
            obj = { parent: pobj };

        EventTarget.mixin(pobj);
        EventTarget.mixin(obj);

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
        var myData = {},
            pobj = {},
            obj = { parent: pobj };

        EventTarget.mixin(pobj);
        EventTarget.mixin(obj);

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
        var called = 0,
            obj = {};

        EventTarget.mixin(obj);

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
        var called = 0,
            obj = {};

        EventTarget.mixin(obj);

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
        var called = 0,
            obj = {};

        EventTarget.mixin(obj);

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
});
