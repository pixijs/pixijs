describe('animation/AnimationManager', function () {
    'use strict';

    var expect = chai.expect;
    var A = PIXI.AnimationManager;

    function SimpleAnimatable() { this.summ = 0; }
    SimpleAnimatable.prototype.advanceTime = function(time) {
        this.summ += time;
    };

    it('check simple animationManagers', function() {
        var sa1 = new SimpleAnimatable();
        var sa2 = new SimpleAnimatable();

        var a = new A();
        a.add(sa1);
        a.advanceTime(12);
        a.add(sa2);
        a.advanceTime(33);
        expect(sa1.summ).to.equal(45, 'Advance time should be passed twice to first object');
        expect(sa2.summ).to.equal(33, 'Advance time should be passed only once to second object');
        a.remove(sa1);
        a.add(sa2); // adding second time should not affect
        a.advanceTime(17);
        expect(sa1.summ).to.equal(45, 'Removed object should not get new notifications');
        expect(sa2.summ).to.equal(50, 'Double adding of same object should not be counted');
    });

    it('adding/removing targets to animationManager while it is executing', function() {
        var a = new A();
        var sa = new SimpleAnimatable();
        var johnny = {
            advanceTime: function(time) {
                this.time = time;
                a.remove(johnny);
                a.add(sa);
            }
        };

        a.add(johnny);
        a.advanceTime(7);
        a.advanceTime(13);
        expect(sa.summ).to.equal(13, 'newly added object should be accounted');
        expect(johnny.time).to.equal(7, 'johnny should be accounted only once');
    });

    it('Use event mechanism for removing object from animation line', function() {
        var a = new A();
        var johnny = {
            time: 0,
            advanceTime: function(time) {
                this.time += time;
                if(this.time > 15) this.emit({ type: PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER,
                                               target: this });
            }
        };
        PIXI.EventTarget.call(johnny);

        a.add(johnny);
        for(var i = 0; i < 4; ++i)
            a.advanceTime(7);
        expect(johnny.time).to.equal(21, 'fourth advanceTime should not be accounted');
    });

    it('Should remove tweens', function() {
        var a = new A();
        var obj1 = { prop1: 1, prop2: 10 };
        var obj2 = { prop1: 1, prop2: 10 };
        a.tween(obj1, 100, { prop1: 2 });
        a.tween(obj2, 90, { prop1: 2, prop2: 77 });
        a.tween(obj1, 80, { prop2: 22 });
        a.advanceTime(74);
        expect(a.containsTweens(obj1)).to.be.true;
        expect(a.containsTweens(obj2)).to.be.true;
        a.removeTweens(obj1);
        expect(a.containsTweens(obj1)).to.be.false;
        expect(a.containsTweens(obj2)).to.be.true;
    });

    it('Check two removes at a row', function() {
        var a = new A();
        var o1 = {
            c: 0,
            advanceTime: function(time) {
                ++this.c;
                this.dispatchEvent( { type: PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER } );
            }
        };
        var o2 = {
            c: 0,
            advanceTime: function(time) {
                ++this.c;
                this.dispatchEvent( { type: PIXI.AnimationManager.EVENT_REMOVE_FROM_ANIMATIONMANAGER } );
            }
        };
        PIXI.EventTarget.call(o2);
        a.add(o1);
        a.add(o2);
        a.remove(o1);
        a.advanceTime(100);
        expect(o2.c).to.be.equal(1, "second should be called at least once");
        a.advanceTime(100);
        expect(o2.c).to.be.equal(1, "second should be called only once");
    });
});
