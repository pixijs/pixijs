describe('animation/Tween', function () {
  'use strict';

  var expect = chai.expect;
  var J = PIXI.Juggler;
  var T = PIXI.Tween;

  it('simple tween', function () {
    var j = new J();
    var o = { size: 12 };
    var t = new T(o, 100);
    t.animate("size", 22);
    j.advanceTime(32);
    j.add(t);
    j.advanceTime(30);
    expect(o.size).to.equal(15, 'Tween should linearly change size value of object');
    j.advanceTime(50);
    expect(o.size).to.equal(20, 'Another tween check');
    j.advanceTime(50);
    expect(o.size).to.equal(22, 'Final value should be set');
  });

  it('main callbacks', function() {
    var j = new J();
    var o = { size: 12 };
    var t = new T(o, 100);
    t.animate("size", 22);
    var startCalled = false;
    t.onStart = function() { startCalled = true; };
    var progress = 0;
    t.onUpdate = function() { ++progress; };
    var completeCalled = false;
    t.onComplete = function() { completeCalled = true; };
    j.add(t);
    j.advanceTime(30);
    expect(startCalled).to.be.true;
    expect(completeCalled).to.be.false;
    j.advanceTime(40);
    j.advanceTime(40);
    expect(completeCalled).to.be.true;
    expect(progress).to.equal(3, "progress should be called 3 times");
  });

  it('scale case check', function() {
    var j = new J();
    var o = { scale: new PIXI.Point(12, 22) };
    var t = new T(o, 100);
    t.animate("scale", new PIXI.Point(22, 42));
    j.add(t);
    j.advanceTime(50);
    expect(o.scale.x).to.be.equal(17, "x should be animated!");
    expect(o.scale.y).to.be.equal(32, "y should be animated!");
  });
});
