/*global
    describe,
    beforeEach,
    afterEach,
    it,
    assert
*/
/**
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
"use strict";

if (typeof require === "function" && typeof module === "object") {
    var referee = require("referee");
    var lolex = require("../src/lolex");
    var sinon = require("sinon");

    global.lolex = lolex; // For testing eval
}

var assert = referee.assert;
var refute = referee.refute;
var GlobalDate = Date;
var NOOP = function NOOP() { return undefined; };

describe("lolex", function () {

    describe("setTimeout", function () {

        beforeEach(function () {
            this.clock = lolex.createClock();
            lolex.evalCalled = false;
        });

        afterEach(function () {
            delete lolex.evalCalled;
        });

        it("throws if no arguments", function () {
            var clock = this.clock;

            assert.exception(function () { clock.setTimeout(); });
        });

        it("returns numeric id or object with numeric id", function () {
            var result = this.clock.setTimeout("");

            if (typeof result === 'object') {
                assert.isNumber(result.id);
            } else {
                assert.isNumber(result);
            }
        });

        it("returns unique id", function () {
            var id1 = this.clock.setTimeout("");
            var id2 = this.clock.setTimeout("");

            refute.equals(id2, id1);
        });

        it("sets timers on instance", function () {
            var clock1 = lolex.createClock();
            var clock2 = lolex.createClock();
            var stubs = [sinon.stub(), sinon.stub()];

            clock1.setTimeout(stubs[0], 100);
            clock2.setTimeout(stubs[1], 100);
            clock2.tick(200);

            assert.isFalse(stubs[0].called);
            assert(stubs[1].called);
        });

        it("evals non-function callbacks", function () {
            this.clock.setTimeout("lolex.evalCalled = true", 10);
            this.clock.tick(10);

            assert(lolex.evalCalled);
        });

        it("passes setTimeout parameters", function () {
            var clock = lolex.createClock();
            var stub = sinon.stub();

            clock.setTimeout(stub, 2, "the first", "the second");

            clock.tick(3);

            assert.isTrue(stub.calledWithExactly("the first", "the second"));
        });

        it("calls correct timeout on recursive tick", function () {
            var clock = lolex.createClock();
            var stub = sinon.stub();
            var recurseCallback = function () { clock.tick(100); };

            clock.setTimeout(recurseCallback, 50);
            clock.setTimeout(stub, 100);

            clock.tick(50);
            assert(stub.called);
        });

        it("does not depend on this", function () {
            var clock = lolex.createClock();
            var stub = sinon.stub();
            var setTimeout = clock.setTimeout;

            setTimeout(stub, 100);

            clock.tick(100);
            assert(stub.called);
        });

        it("is not influenced by forward system clock changes", function () {
            var stub = sinon.stub();
            this.clock.setTimeout(stub, 5000);
            this.clock.tick(1000);
            this.clock.setSystemTime((new this.clock.Date()).getTime() + 1000);
            this.clock.tick(3990);
            assert.equals(stub.callCount, 0);
            this.clock.tick(20);
            assert.equals(stub.callCount, 1);
        });

        it("is not influenced by backward system clock changes", function () {
            var stub = sinon.stub();
            this.clock.setTimeout(stub, 5000);
            this.clock.tick(1000);
            this.clock.setSystemTime((new this.clock.Date()).getTime() - 1000);
            this.clock.tick(3990);
            assert.equals(stub.callCount, 0);
            this.clock.tick(20);
            assert.equals(stub.callCount, 1);
        });
    });

     describe("setImmediate", function () {

        beforeEach(function () {
            this.clock = lolex.createClock();
        });

        it("returns numeric id or object with numeric id", function () {
            var result = this.clock.setImmediate(NOOP);

            if (typeof result === 'object') {
                assert.isNumber(result.id);
            } else {
                assert.isNumber(result);
            }
        });

        it("calls the given callback immediately", function () {
            var stub = sinon.stub();

            this.clock.setImmediate(stub);
            this.clock.tick(0);

            assert(stub.called);
        });

        it("throws if no arguments", function () {
            var clock = this.clock;

            assert.exception(function () {
                clock.setImmediate();
            });
        });

        it("manages separate timers per clock instance", function () {
            var clock1 = lolex.createClock();
            var clock2 = lolex.createClock();
            var stubs = [sinon.stub(), sinon.stub()];

            clock1.setImmediate(stubs[0]);
            clock2.setImmediate(stubs[1]);
            clock2.tick(0);

            assert.isFalse(stubs[0].called);
            assert(stubs[1].called);
        });

        it("passes extra parameters through to the callback", function () {
            var stub = sinon.stub();

            this.clock.setImmediate(stub, 'value1', 2);
            this.clock.tick(1);

            assert(stub.calledWithExactly('value1', 2));
        });

        it("calls the given callback before setTimeout", function () {
            var stub1 = sinon.stub.create();
            var stub2 = sinon.stub.create();

            this.clock.setTimeout(stub1, 0);
            this.clock.setImmediate(stub2);
            this.clock.tick(0);

            assert(stub1.calledOnce);
            assert(stub2.calledOnce);
            assert(stub2.calledBefore(stub1));
        });

        it("does not stuck next tick even if nested", function () {
            var clock = this.clock;

            clock.setImmediate(function f() {
                clock.setImmediate(f);
            });

            clock.tick(0);
        });
    });

    describe("clearImmediate", function () {

        beforeEach(function () {
            this.clock = lolex.createClock();
        });

        it("removes immediate callbacks", function () {
            var callback = sinon.stub();

            var id = this.clock.setImmediate(callback);
            this.clock.clearImmediate(id);
            this.clock.tick(1);

            assert.isFalse(callback.called);
        });

        it("does not remove timeout", function () {
            var callback = sinon.stub();

            var id = this.clock.setTimeout(callback, 50);
            assert.exception(function() {
                this.clock.clearImmediate(id);
            });
            this.clock.tick(55);

            assert.isTrue(callback.called);
        });

        it("does not remove interval", function () {
            var callback = sinon.stub();

            var id = this.clock.setInterval(callback, 50);
            assert.exception(function() {
                this.clock.clearImmediate(id);
            });
            this.clock.tick(55);

            assert.isTrue(callback.called);
        });

    });

    describe("tick", function () {

        beforeEach(function () {
            this.clock = lolex.install(0);
        });

        afterEach(function () {
            this.clock.uninstall();
        });

        it("triggers immediately without specified delay", function () {
            var stub = sinon.stub();
            this.clock.setTimeout(stub);

            this.clock.tick(0);

            assert(stub.called);
        });

        it("does not trigger without sufficient delay", function () {
            var stub = sinon.stub();
            this.clock.setTimeout(stub, 100);
            this.clock.tick(10);

            assert.isFalse(stub.called);
        });

        it("triggers after sufficient delay", function () {
            var stub = sinon.stub();
            this.clock.setTimeout(stub, 100);
            this.clock.tick(100);

            assert(stub.called);
        });

        it("triggers simultaneous timers", function () {
            var spies = [sinon.spy(), sinon.spy()];
            this.clock.setTimeout(spies[0], 100);
            this.clock.setTimeout(spies[1], 100);

            this.clock.tick(100);

            assert(spies[0].called);
            assert(spies[1].called);
        });

        it("triggers multiple simultaneous timers", function () {
            var spies = [sinon.spy(), sinon.spy(), sinon.spy(), sinon.spy()];
            this.clock.setTimeout(spies[0], 100);
            this.clock.setTimeout(spies[1], 100);
            this.clock.setTimeout(spies[2], 99);
            this.clock.setTimeout(spies[3], 100);

            this.clock.tick(100);

            assert(spies[0].called);
            assert(spies[1].called);
            assert(spies[2].called);
            assert(spies[3].called);
        });

        it("triggers multiple simultaneous timers with zero callAt", function () {
            var test = this;
            var spies = [
                sinon.spy(function () {
                    test.clock.setTimeout(spies[1], 0);
                }),
                sinon.spy(),
                sinon.spy()
            ];

            // First spy calls another setTimeout with delay=0
            this.clock.setTimeout(spies[0], 0);
            this.clock.setTimeout(spies[2], 10);

            this.clock.tick(10);

            assert(spies[0].called);
            assert(spies[1].called);
            assert(spies[2].called);
        });

        it("waits after setTimeout was called", function () {
            this.clock.tick(100);
            var stub = sinon.stub();
            this.clock.setTimeout(stub, 150);
            this.clock.tick(50);

            assert.isFalse(stub.called);
            this.clock.tick(100);
            assert(stub.called);
        });

        it("mini integration test", function () {
            var stubs = [sinon.stub(), sinon.stub(), sinon.stub()];
            this.clock.setTimeout(stubs[0], 100);
            this.clock.setTimeout(stubs[1], 120);
            this.clock.tick(10);
            this.clock.tick(89);
            assert.isFalse(stubs[0].called);
            assert.isFalse(stubs[1].called);
            this.clock.setTimeout(stubs[2], 20);
            this.clock.tick(1);
            assert(stubs[0].called);
            assert.isFalse(stubs[1].called);
            assert.isFalse(stubs[2].called);
            this.clock.tick(19);
            assert.isFalse(stubs[1].called);
            assert(stubs[2].called);
            this.clock.tick(1);
            assert(stubs[1].called);
        });

        it("triggers even when some throw", function () {
            var clock = this.clock;
            var stubs = [sinon.stub().throws(), sinon.stub()];

            clock.setTimeout(stubs[0], 100);
            clock.setTimeout(stubs[1], 120);

            assert.exception(function () {
                clock.tick(120);
            });

            assert(stubs[0].called);
            assert(stubs[1].called);
        });

        it("calls function with global object or null (strict mode) as this", function () {
            var clock = this.clock;
            var stub = sinon.stub().throws();
            clock.setTimeout(stub, 100);

            assert.exception(function () {
                clock.tick(100);
            });

            assert(stub.calledOn(global) || stub.calledOn(null));
        });

        it("triggers in the order scheduled", function () {
            var spies = [sinon.spy(), sinon.spy()];
            this.clock.setTimeout(spies[0], 13);
            this.clock.setTimeout(spies[1], 11);

            this.clock.tick(15);

            assert(spies[1].calledBefore(spies[0]));
        });

        it("creates updated Date while ticking", function () {
            var spy = sinon.spy();

            this.clock.setInterval(function () {
                spy(new Date().getTime());
            }, 10);

            this.clock.tick(100);

            assert.equals(spy.callCount, 10);
            assert(spy.calledWith(10));
            assert(spy.calledWith(20));
            assert(spy.calledWith(30));
            assert(spy.calledWith(40));
            assert(spy.calledWith(50));
            assert(spy.calledWith(60));
            assert(spy.calledWith(70));
            assert(spy.calledWith(80));
            assert(spy.calledWith(90));
            assert(spy.calledWith(100));
        });

        it("fires timer in intervals of 13", function () {
            var spy = sinon.spy();
            this.clock.setInterval(spy, 13);

            this.clock.tick(500);

            assert.equals(spy.callCount, 38);
        });

        it("fires timers in correct order", function () {
            var spy13 = sinon.spy();
            var spy10 = sinon.spy();

            this.clock.setInterval(function () {
                spy13(new Date().getTime());
            }, 13);

            this.clock.setInterval(function () {
                spy10(new Date().getTime());
            }, 10);

            this.clock.tick(500);

            assert.equals(spy13.callCount, 38);
            assert.equals(spy10.callCount, 50);

            assert(spy13.calledWith(416));
            assert(spy10.calledWith(320));

            assert(spy10.getCall(0).calledBefore(spy13.getCall(0)));
            assert(spy10.getCall(4).calledBefore(spy13.getCall(3)));
        });

        it("triggers timeouts and intervals in the order scheduled", function () {
            var spies = [sinon.spy(), sinon.spy()];
            this.clock.setInterval(spies[0], 10);
            this.clock.setTimeout(spies[1], 50);

            this.clock.tick(100);

            assert(spies[0].calledBefore(spies[1]));
            assert.equals(spies[0].callCount, 10);
            assert.equals(spies[1].callCount, 1);
        });

        it("does not fire canceled intervals", function () {
            var id;
            var callback = sinon.spy(function () {
                if (callback.callCount === 3) {
                    clearInterval(id);
                }
            });

            id = this.clock.setInterval(callback, 10);
            this.clock.tick(100);

            assert.equals(callback.callCount, 3);
        });

        it("passes 6 seconds", function () {
            var spy = sinon.spy();
            this.clock.setInterval(spy, 4000);

            this.clock.tick("08");

            assert.equals(spy.callCount, 2);
        });

        it("passes 1 minute", function () {
            var spy = sinon.spy();
            this.clock.setInterval(spy, 6000);

            this.clock.tick("01:00");

            assert.equals(spy.callCount, 10);
        });

        it("passes 2 hours, 34 minutes and 12 seconds", function () {
            var spy = sinon.spy();
            this.clock.setInterval(spy, 10000);

            this.clock.tick("02:34:10");

            assert.equals(spy.callCount, 925);
        });

        it("throws for invalid format", function () {
            var spy = sinon.spy();
            this.clock.setInterval(spy, 10000);
            var test = this;

            assert.exception(function () {
                test.clock.tick("12:02:34:10");
            });

            assert.equals(spy.callCount, 0);
        });

        it("throws for invalid minutes", function () {
            var spy = sinon.spy();
            this.clock.setInterval(spy, 10000);
            var test = this;

            assert.exception(function () {
                test.clock.tick("67:10");
            });

            assert.equals(spy.callCount, 0);
        });

        it("throws for negative minutes", function () {
            var spy = sinon.spy();
            this.clock.setInterval(spy, 10000);
            var test = this;

            assert.exception(function () {
                test.clock.tick("-7:10");
            });

            assert.equals(spy.callCount, 0);
        });

        it("treats missing argument as 0", function () {
            this.clock.tick();

            assert.equals(this.clock.now, 0);
        });

        it("fires nested setTimeout calls properly", function () {
            var i = 0;
            var clock = this.clock;

            var callback = function () {
                ++i;
                clock.setTimeout(function () {
                    callback();
                }, 100);
            };

            callback();

            clock.tick(1000);

            assert.equals(i, 11);
        });

        it("does not silently catch errors", function () {
            var clock = this.clock;

            clock.setTimeout(function () {
                throw new Error("oh no!");
            }, 1000);

            assert.exception(function () {
                clock.tick(1000);
            });
        });

        it("returns the current now value", function () {
            var clock = this.clock;
            var value = clock.tick(200);
            assert.equals(clock.now, value);
        });
    });

    describe("clearTimeout", function () {

        beforeEach(function () {
            this.clock = lolex.createClock();
        });

        it("removes timeout", function () {
            var stub = sinon.stub();
            var id = this.clock.setTimeout(stub, 50);
            this.clock.clearTimeout(id);
            this.clock.tick(50);

            assert.isFalse(stub.called);
        });

        it("does not remove interval", function () {
            var stub = sinon.stub();
            var id = this.clock.setInterval(stub, 50);
            assert.exception(function() {
                this.clock.clearTimeout(id);
            });
            this.clock.tick(50);

            assert.isTrue(stub.called);
        });

        it("does not remove immediate", function () {
            var stub = sinon.stub();
            var id = this.clock.setImmediate(stub);
            assert.exception(function() {
                this.clock.clearTimeout(id);
            });
            this.clock.tick(50);

            assert.isTrue(stub.called);
        });

        it("ignores null argument", function () {
            this.clock.clearTimeout(null);
            assert(true); // doesn't fail
        });
    });

    describe("reset", function () {

        beforeEach(function () {
            this.clock = lolex.createClock();
        });

        it("empties timeouts queue", function () {
            var stub = sinon.stub();
            this.clock.setTimeout(stub);
            this.clock.reset();
            this.clock.tick(0);

            assert.isFalse(stub.called);
        });
    });

    describe("setInterval", function () {

        beforeEach(function () {
            this.clock = lolex.createClock();
        });

        it("throws if no arguments", function () {
            var clock = this.clock;

            assert.exception(function () {
                clock.setInterval();
            });
        });

        it("returns numeric id or object with numeric id", function () {
            var result = this.clock.setInterval("");

            if (typeof result === 'object') {
                assert.isNumber(result.id);
            } else {
                assert.isNumber(result);
            }
        });

        it("returns unique id", function () {
            var id1 = this.clock.setInterval("");
            var id2 = this.clock.setInterval("");

            refute.equals(id2, id1);
        });

        it("schedules recurring timeout", function () {
            var stub = sinon.stub();
            this.clock.setInterval(stub, 10);
            this.clock.tick(99);

            assert.equals(stub.callCount, 9);
        });

        it("is not influenced by forward system clock changes", function () {
            var stub = sinon.stub();
            this.clock.setInterval(stub, 10);
            this.clock.tick(11);
            assert.equals(stub.callCount, 1);
            this.clock.setSystemTime((new this.clock.Date()).getTime() + 1000);
            this.clock.tick(8);
            assert.equals(stub.callCount, 1);
            this.clock.tick(3);
            assert.equals(stub.callCount, 2);
        });

        it("is not influenced by backward system clock changes", function () {
            var stub = sinon.stub();
            this.clock.setInterval(stub, 10);
            this.clock.tick(5);
            this.clock.setSystemTime((new this.clock.Date()).getTime() - 1000);
            this.clock.tick(6);
            assert.equals(stub.callCount, 1);
            this.clock.tick(10);
            assert.equals(stub.callCount, 2);
        });

        it("does not schedule recurring timeout when cleared", function () {
            var clock = this.clock;
            var id;
            var stub = sinon.spy(function () {
                if (stub.callCount === 3) {
                    clock.clearInterval(id);
                }
            });

            id = this.clock.setInterval(stub, 10);
            this.clock.tick(100);

            assert.equals(stub.callCount, 3);
        });

        it("passes setTimeout parameters", function () {
            var clock = lolex.createClock();
            var stub = sinon.stub();

            clock.setInterval(stub, 2, "the first", "the second");

            clock.tick(3);

            assert.isTrue(stub.calledWithExactly("the first", "the second"));
        });
    });

    describe("clearInterval", function () {

        beforeEach(function () {
            this.clock = lolex.createClock();
        });

        it("removes interval", function () {
            var stub = sinon.stub();
            var id = this.clock.setInterval(stub, 50);
            this.clock.clearInterval(id);
            this.clock.tick(50);

            assert.isFalse(stub.called);
        });

        it("does not remove timeout", function () {
            var stub = sinon.stub();
            var id = this.clock.setTimeout(stub, 50);
            assert.exception(function() {
                this.clock.clearInterval(id);
            });
            this.clock.tick(50);
            assert.isTrue(stub.called);
        });

        it("does not remove immediate", function () {
            var stub = sinon.stub();
            var id = this.clock.setImmediate(stub);
            assert.exception(function() {
                this.clock.clearInterval(id);
            });
            this.clock.tick(50);

            assert.isTrue(stub.called);
        });

        it("ignores null argument", function () {
            this.clock.clearInterval(null);
            assert(true); // doesn't fail
        });
    });

    describe("date", function () {

        beforeEach(function () {
            this.now = new GlobalDate().getTime() - 3000;
            this.clock = lolex.createClock(this.now);
            this.Date = global.Date;
        });

        afterEach(function () {
            global.Date = this.Date;
        });

        it("provides date constructor", function () {
            assert.isFunction(this.clock.Date);
        });

        it("creates real Date objects", function () {
            var date = new this.clock.Date();

            assert(Date.prototype.isPrototypeOf(date));
        });

        it("creates real Date objects when called as function", function () {
            var date = this.clock.Date();

            assert(Date.prototype.isPrototypeOf(date));
        });

        it("creates real Date objects when Date constructor is gone", function () {
            var realDate = new Date();
            Date = NOOP;
            global.Date = NOOP;

            var date = new this.clock.Date();

            assert.same(date.constructor.prototype, realDate.constructor.prototype);
        });

        it("creates Date objects representing clock time", function () {
            var date = new this.clock.Date();

            assert.equals(date.getTime(), new Date(this.now).getTime());
        });

        it("returns Date object representing clock time", function () {
            var date = this.clock.Date();

            assert.equals(date.getTime(), new Date(this.now).getTime());
        });

        it("listens to ticking clock", function () {
            var date1 = new this.clock.Date();
            this.clock.tick(3);
            var date2 = new this.clock.Date();

            assert.equals(date2.getTime() - date1.getTime(), 3);
        });

        it("listens to system clock changes", function () {
            var date1 = new this.clock.Date();
            this.clock.setSystemTime(date1.getTime() + 1000);
            var date2 = new this.clock.Date();

            assert.equals(date2.getTime() - date1.getTime(), 1000);
        });

        it("creates regular date when passing timestamp", function () {
            var date = new Date();
            var fakeDate = new this.clock.Date(date.getTime());

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("returns regular date when calling with timestamp", function () {
            var date = new Date();
            var fakeDate = this.clock.Date(date.getTime());

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("creates regular date when passing year, month", function () {
            var date = new Date(2010, 4);
            var fakeDate = new this.clock.Date(2010, 4);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("returns regular date when calling with year, month", function () {
            var date = new Date(2010, 4);
            var fakeDate = this.clock.Date(2010, 4);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("creates regular date when passing y, m, d", function () {
            var date = new Date(2010, 4, 2);
            var fakeDate = new this.clock.Date(2010, 4, 2);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("returns regular date when calling with y, m, d", function () {
            var date = new Date(2010, 4, 2);
            var fakeDate = this.clock.Date(2010, 4, 2);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("creates regular date when passing y, m, d, h", function () {
            var date = new Date(2010, 4, 2, 12);
            var fakeDate = new this.clock.Date(2010, 4, 2, 12);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("returns regular date when calling with y, m, d, h", function () {
            var date = new Date(2010, 4, 2, 12);
            var fakeDate = this.clock.Date(2010, 4, 2, 12);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("creates regular date when passing y, m, d, h, m", function () {
            var date = new Date(2010, 4, 2, 12, 42);
            var fakeDate = new this.clock.Date(2010, 4, 2, 12, 42);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("returns regular date when calling with y, m, d, h, m", function () {
            var date = new Date(2010, 4, 2, 12, 42);
            var fakeDate = this.clock.Date(2010, 4, 2, 12, 42);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("creates regular date when passing y, m, d, h, m, s", function () {
            var date = new Date(2010, 4, 2, 12, 42, 53);
            var fakeDate = new this.clock.Date(2010, 4, 2, 12, 42, 53);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("returns regular date when calling with y, m, d, h, m, s", function () {
            var date = new Date(2010, 4, 2, 12, 42, 53);
            var fakeDate = this.clock.Date(2010, 4, 2, 12, 42, 53);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("creates regular date when passing y, m, d, h, m, s, ms", function () {
            var date = new Date(2010, 4, 2, 12, 42, 53, 498);
            var fakeDate = new this.clock.Date(2010, 4, 2, 12, 42, 53, 498);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("returns regular date when calling with y, m, d, h, m, s, ms", function () {
            var date = new Date(2010, 4, 2, 12, 42, 53, 498);
            var fakeDate = this.clock.Date(2010, 4, 2, 12, 42, 53, 498);

            assert.equals(fakeDate.getTime(), date.getTime());
        });

        it("mirrors native Date.prototype", function () {
            assert.same(this.clock.Date.prototype, Date.prototype);
        });

        it("supports now method if present", function () {
            assert.same(typeof this.clock.Date.now, typeof Date.now);
        });

        if (Date.now) {
            describe("now", function () {
                it("returns clock.now", function () {
                    var clock_now = this.clock.Date.now();
                    var global_now = GlobalDate.now();

                    assert(this.now <= clock_now && clock_now <= global_now);
                });
            });
        } else {
            describe("unsupported now", function () {
                it("is undefined", function () {
                    refute.defined(this.clock.Date.now);
                });
            });
        }

        it("mirrors parse method", function () {
            assert.same(this.clock.Date.parse, Date.parse);
        });

        it("mirrors UTC method", function () {
            assert.same(this.clock.Date.UTC, Date.UTC);
        });

        it("mirrors toUTCString method", function () {
            assert.same(this.clock.Date.prototype.toUTCString, Date.prototype.toUTCString);
        });

        if (Date.toSource) {
            describe("toSource", function () {

                it("is mirrored", function () {
                    assert.same(this.clock.Date.toSource(), Date.toSource());
                });

            });
        } else {
            describe("unsupported toSource", function () {

                it("is undefined", function () {
                    refute.defined(this.clock.Date.toSource);
                });

            });
        }

        it("mirrors toString", function () {
            assert.same(this.clock.Date.toString(), Date.toString());
        });
    });

    describe("stubTimers", function () {

        beforeEach(function () {
            this.dateNow = global.Date.now;
        });

        afterEach(function () {
            if (this.clock) {
                this.clock.uninstall();
            }

            clearTimeout(this.timer);
            if (this.dateNow === undefined) {
                delete global.Date.now;
            } else {
                global.Date.now = this.dateNow;
            }
        });

        it("returns clock object", function () {
            this.clock = lolex.install();

            assert.isObject(this.clock);
            assert.isFunction(this.clock.tick);
        });

        it("has clock property", function () {
            this.clock = lolex.install();

            assert.same(setTimeout.clock, this.clock);
            assert.same(clearTimeout.clock, this.clock);
            assert.same(setInterval.clock, this.clock);
            assert.same(clearInterval.clock, this.clock);
            assert.same(Date.clock, this.clock);
        });

        it("sets initial timestamp", function () {
            this.clock = lolex.install(1400);

            assert.equals(this.clock.now, 1400);
        });

        it("replaces global setTimeout", function () {
            this.clock = lolex.install();
            var stub = sinon.stub();

            setTimeout(stub, 1000);
            this.clock.tick(1000);

            assert(stub.called);
        });

        it("global fake setTimeout should return id", function () {
            this.clock = lolex.install();
            var stub = sinon.stub();

            var to = setTimeout(stub, 1000);

            if (typeof (setTimeout(NOOP, 0)) === 'object') {
                assert.isNumber(to.id);
                assert.isFunction(to.ref);
                assert.isFunction(to.unref);
            } else {
                assert.isNumber(to);
            }
        });

        it("replaces global clearTimeout", function () {
            this.clock = lolex.install();
            var stub = sinon.stub();

            clearTimeout(setTimeout(stub, 1000));
            this.clock.tick(1000);

            assert.isFalse(stub.called);
        });

        it("uninstalls global setTimeout", function () {
            this.clock = lolex.install();
            var stub = sinon.stub();
            this.clock.uninstall();

            this.timer = setTimeout(stub, 1000);
            this.clock.tick(1000);

            assert.isFalse(stub.called);
            assert.same(setTimeout, lolex.timers.setTimeout);
        });

        it("uninstalls global clearTimeout", function () {
            this.clock = lolex.install();
            sinon.stub();
            this.clock.uninstall();

            assert.same(clearTimeout, lolex.timers.clearTimeout);
        });

        it("replaces global setInterval", function () {
            this.clock = lolex.install();
            var stub = sinon.stub();

            setInterval(stub, 500);
            this.clock.tick(1000);

            assert(stub.calledTwice);
        });

        it("replaces global clearInterval", function () {
            this.clock = lolex.install();
            var stub = sinon.stub();

            clearInterval(setInterval(stub, 500));
            this.clock.tick(1000);

            assert.isFalse(stub.called);
        });

        it("uninstalls global setInterval", function () {
            this.clock = lolex.install();
            var stub = sinon.stub();
            this.clock.uninstall();

            this.timer = setInterval(stub, 1000);
            this.clock.tick(1000);

            assert.isFalse(stub.called);
            assert.same(setInterval, lolex.timers.setInterval);
        });

        it("uninstalls global clearInterval", function () {
            this.clock = lolex.install();
            sinon.stub();
            this.clock.uninstall();

            assert.same(clearInterval, lolex.timers.clearInterval);
        });

        if (global.__proto__) {
            delete global.hasOwnPropertyTest;
            global.__proto__.hasOwnPropertyTest = function() {};

            if (!global.hasOwnProperty("hasOwnPropertyTest")) {
                it("deletes global property on uninstall if it was inherited onto the global object", function () {
                    // Give the global object an inherited 'tick' method
                    delete global.tick;
                    global.__proto__.tick = function() { };

                    this.clock = lolex.install(0, ['tick']);
                    assert.isTrue(global.hasOwnProperty("tick"));
                    this.clock.uninstall();

                    assert.isFalse(global.hasOwnProperty("tick"));
                    delete global.__proto__.tick;
                });
            }

            delete global.__proto__.hasOwnPropertyTest;
        }

        it("uninstalls global property on uninstall if it is present on the global object itself", function () {
            // Directly give the global object a tick method
            global.tick = NOOP;

            this.clock = lolex.install(0, ['tick']);
            assert.isTrue(global.hasOwnProperty("tick"));
            this.clock.uninstall();

            assert.isTrue(global.hasOwnProperty("tick"));
            delete global.tick;
        });

        it("fakes Date constructor", function () {
            this.clock = lolex.install(0);
            var now = new Date();

            refute.same(Date, lolex.timers.Date);
            assert.equals(now.getTime(), 0);
        });

        it("fake Date constructor should mirror Date's properties", function () {
            this.clock = lolex.install(0);

            assert(!!Date.parse);
            assert(!!Date.UTC);
        });

        it("decide on Date.now support at call-time when supported", function () {
            global.Date.now = NOOP;
            this.clock = lolex.install(0);

            assert.equals(typeof Date.now, "function");
        });

        it("decide on Date.now support at call-time when unsupported", function () {
            global.Date.now = undefined;
            this.clock = lolex.install(0);

            refute.defined(Date.now);
        });

        // TODO: The following tests causes test suite instability

        it("mirrors custom Date properties", function () {
            var f = function () { };
            global.Date.format = f;
            this.clock = lolex.install();

            assert.equals(Date.format, f);
        });

        it("uninstalls Date constructor", function () {
            this.clock = lolex.install(0);
            this.clock.uninstall();

            assert.same(GlobalDate, lolex.timers.Date);
        });

        it("fakes provided methods", function () {
            this.clock = lolex.install(0, ["setTimeout", "Date", "setImmediate"]);

            refute.same(setTimeout, lolex.timers.setTimeout);
            refute.same(Date, lolex.timers.Date);
        });

        it("resets faked methods", function () {
            this.clock = lolex.install(0, ["setTimeout", "Date", "setImmediate"]);
            this.clock.uninstall();

            assert.same(setTimeout, lolex.timers.setTimeout);
            assert.same(Date, lolex.timers.Date);
        });

        it("does not fake methods not provided", function () {
            this.clock = lolex.install(0, ["setTimeout", "Date", "setImmediate"]);

            assert.same(clearTimeout, lolex.timers.clearTimeout);
            assert.same(setInterval, lolex.timers.setInterval);
            assert.same(clearInterval, lolex.timers.clearInterval);
        });

        it("does not be able to use date object for now", function () {
            assert.exception(function () {
                lolex.install(new Date(2011, 9, 1));
            });
        });
    });
});
