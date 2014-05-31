describe('animation/Juggler', function () {
  'use strict';

  var expect = chai.expect;
  var J = PIXI.Juggler;

  function SimpleAnimatable() { this.summ = 0; }
  SimpleAnimatable.prototype.advanceTime = function(time) {
    this.summ += time;
  };

  it('advanced time accounting', function () {
    var j = new J();
    expect(j.elapsedTime).to.equal(0, 'Initial value for juggler is zero');
    j.advanceTime(1988);
    expect(j.elapsedTime).to.equal(1988, 'Even with empty pool elapsed time should be accounted');
    j.advanceTime(12);
    expect(j.elapsedTime).to.equal(2000, 'Time should be accumulated');
  });

  it('check simple jugglers', function() {
    var sa1 = new SimpleAnimatable();
    var sa2 = new SimpleAnimatable();

    var j = new J();
    j.add(sa1);
    j.advanceTime(12);
    j.add(sa2);
    j.advanceTime(33);
    expect(sa1.summ).to.equal(45, 'Advance time should be passed twice to first object');
    expect(sa2.summ).to.equal(33, 'Advance time should be passed only once to second object');
    j.remove(sa1);
    j.add(sa2); // adding second time should not affect
    j.advanceTime(17);
    expect(sa1.summ).to.equal(45, 'Removed object should not get new notifications');
    expect(sa2.summ).to.equal(50, 'Double adding of same object should not be counted');
  });

  it('adding/removing targets to juggler while it is executing', function() {
    var j = new J();
    var sa = new SimpleAnimatable();
    var johnny = {
      advanceTime: function(time) {
        this.time = time;
        j.remove(johnny);
        j.add(sa);
      }
    };

    j.add(johnny);
    j.advanceTime(7);
    j.advanceTime(13);
    expect(sa.summ).to.equal(13, 'newly added object should be accounted');
    expect(johnny.time).to.equal(7, 'johnny should be accounted only once');
  });

  it('Boolean advanceTime(Number) marks if animation should be removed from juggler', function() {
    var j = new J();
    var johnny = {
      time: 0,
      advanceTime: function(time) {
        this.time += time;
        return this.time > 15;
      }
    };

    j.add(johnny);
    for(var i = 0; i < 4; ++i)
      j.advanceTime(7);
    expect(johnny.time).to.equal(21, 'fourth advanceTime should not be accounted');
  });
});
