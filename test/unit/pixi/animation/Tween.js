describe('animation/Tween', function () {
    'use strict';

    var expect = chai.expect;
    var A = PIXI.AnimationManager;
    var T = PIXI.Tween;

    it('simple tween', function () {
        var a = new A();
        var o = { size: 12 };
        var t = new T(o, 100);
        t.animate("size", 22);
        a.advanceTime(32);
        a.add(t);
        a.advanceTime(30);
        expect(o.size).to.equal(15, 'Tween should linearly change size value of object');
        a.advanceTime(50);
        expect(o.size).to.equal(20, 'Another tween check');
        a.advanceTime(50);
        expect(o.size).to.equal(22, 'Final value should be set');
    });

    it('main callbacks', function() {
        var a = new A();
        var o = { size: 12 };
        var t = new T(o, 100);
        t.animate("size", 22);
        var startCalled = false;
        t.onStart = function() { startCalled = true; };
        var progress = 0;
        t.onUpdate = function() { ++progress; };
        var completeCalled = false;
        t.onComplete = function() { completeCalled = true; };
        a.add(t);
        a.advanceTime(30);
        expect(startCalled).to.be.true;
        expect(completeCalled).to.be.false;
        a.advanceTime(40);
        a.advanceTime(40);
        expect(completeCalled).to.be.true;
        expect(progress).to.equal(3, "progress should be called 3 times");
    });

    it('scale case check', function() {
        var a = new A();
        var o = { scale: new PIXI.Point(12, 22) };
        var t = new T(o, 100);
        t.animate("scale", new PIXI.Point(22, 42));
        a.add(t);
        a.advanceTime(50);
        expect(o.scale.x).to.be.equal(17, "x should be animated!");
        expect(o.scale.y).to.be.equal(32, "y should be animated!");
    });
});
