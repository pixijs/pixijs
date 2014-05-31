describe('animation/DelayedCall', function () {
    'use strict';

    var expect = chai.expect;
    var A = PIXI.AnimationManager;
    var D = PIXI.DelayedCall;

    it('simple delayed call', function () {
        var a = new A();
        var callN = 0;
        var d = new D(function() { ++callN; }, 100);
        a.add(d);
        a.advanceTime(70);
        expect(callN).to.be.equal(0, "Delayed call should not be called");
        expect(d.isComplete).to.be.false;
        a.advanceTime(30);
        expect(callN).to.be.equal(1, "Delayed call should be called once");
        expect(d.isComplete).to.be.true;
        a.advanceTime(110);
        expect(callN).to.be.equal(1, "Delayed call should no be called more");
        expect(d.isComplete).to.be.true;
    });

    it('repeated delayed call', function() {
        var a = new A();
        var callN = 0;
        var d = new D(function() { ++callN; }, 100);
        d.repeatCount = 3;
        a.add(d);
        a.advanceTime(70);
        expect(callN).to.be.equal(0, "Delayed call should not be called");
        expect(d.isComplete).to.be.false;
        a.advanceTime(70);
        expect(callN).to.be.equal(1, "Delayed call should be called once");
        expect(d.isComplete).to.be.false;
        a.advanceTime(70);
        expect(callN).to.be.equal(2, "Delayed call should be called twice");
        expect(d.isComplete).to.be.false;
        a.advanceTime(90);
        expect(callN).to.be.equal(3, "Delayed call should be called three times and complete");
        expect(d.isComplete).to.be.true;
        a.advanceTime(110);
        expect(callN).to.be.equal(3, "Delayed call should be called any more times");
        expect(d.isComplete).to.be.true;
    });

    it('delayed call should reset', function() {
        var a = new A();
        var callN = 0;
        var d = new D(function() { ++callN; }, 100);
        d.repeatCount = 2;
        a.add(d);
        a.advanceTime(250);
        expect(callN).to.be.equal(2, "Repeated call should be executed.");
        expect(d.isComplete).to.be.true;
        d.reset(function() { callN -= 3; }, 100);
        d.repeatCount = 2;
        a.add(d);
        expect(d.isComplete).to.be.false;
        a.advanceTime(250);
        expect(callN).to.be.equal(2 - 6, "New functon should be executed 2 times");
        expect(d.isComplete).to.be.true;
    });
});
