'use strict';

describe('PIXI.ObservablePoint', function ()
{
    it('should create a new observable point', function ()
    {
        const cb = sinon.spy();
        const pt = new PIXI.ObservablePoint(cb, this);

        expect(pt.x).to.equal(0);
        expect(pt.y).to.equal(0);

        pt.set(2, 5);
        expect(pt.x).to.equal(2);
        expect(pt.y).to.equal(5);

        expect(cb.called).to.be.true;

        pt.set(2, 6);
        expect(pt.x).to.equal(2);
        expect(pt.y).to.equal(6);

        pt.set(2, 0);
        expect(pt.x).to.equal(2);
        expect(pt.y).to.equal(0);

        pt.set();
        expect(pt.x).to.equal(0);
        expect(pt.y).to.equal(0);

        expect(cb.callCount).to.equal(4);
    });

    it('should copy a new observable point', function ()
    {
        function cb()
        {
            // do nothing
        }

        const p1 = new PIXI.ObservablePoint(cb, this, 10, 20);
        const p2 = new PIXI.ObservablePoint(cb, this, 5, 2);
        const p3 = new PIXI.ObservablePoint(cb, this, 5, 6);

        p1.copy(p2);
        expect(p1.x).to.equal(p2.x);
        expect(p1.y).to.equal(p2.y);

        p1.copy(p3);
        expect(p1.y).to.equal(p3.y);
    });

    it('should properly add and remove change listeners', function ()
    {
        const cb = sinon.spy();
        const changeListener1 = sinon.spy();
        const changeListener2 = sinon.spy();
        const p1 = new PIXI.ObservablePoint(cb, this, 10, 20);

        p1.addChangeListener(changeListener1);
        expect(p1._listeners.length).to.equal(1);
        p1.x += 1;
        expect(cb.callCount).to.equal(1);
        expect(changeListener1.calledWith(11, 20)).to.be.true;
        expect(changeListener1.callCount).to.equal(1);

        p1.set(2, 2);
        expect(cb.callCount).to.equal(2);
        expect(changeListener1.callCount).to.equal(2);
        expect(changeListener1.calledWith(0, 0)).to.be.false;
        expect(changeListener1.calledWith(2, 2)).to.be.true;

        p1.removeChangeListener(changeListener1);
        expect(p1._listeners.length).to.equal(0);

        p1.addChangeListener(changeListener1);
        p1.addChangeListener(changeListener2);
        expect(p1._listeners.length).to.equal(2);

        p1.y += 2;
        expect(cb.callCount).to.equal(3);
        expect(changeListener1.callCount).to.equal(3);
        expect(changeListener2.callCount).to.equal(1);
        expect(changeListener1.calledWith(2, 4)).to.be.true;
        expect(changeListener2.calledWith(2, 4)).to.be.true;

        p1.purgeListeners();
        p1.y -= 2;
        expect(p1._listeners.length).to.equal(0);
        expect(cb.callCount).to.equal(4);
        expect(changeListener1.callCount).to.equal(3);
        expect(changeListener2.callCount).to.equal(1);
    });

    it('should properly link and unlink Observable Points to each other', function ()
    {
        const cb1 = sinon.spy();
        const cb2 = sinon.spy();
        const p1 = new PIXI.ObservablePoint(cb1, this, 10, 20);
        const p2 = new PIXI.ObservablePoint(cb2, this, 5, 2);

        p1.linkTo(p2);
        expect(cb1.callCount).to.equal(1);
        expect(cb2.callCount).to.equal(0);
        expect(p1._broadcasters.length).to.equal(1);
        expect(p2._listeners.length).to.equal(1);
        expect(p1._listeners.length).to.equal(0);
        expect(p2._broadcasters.length).to.equal(0);
        expect(p1.x).to.equal(p2.x);
        expect(p1.y).to.equal(p2.y);

        p2.set(4, 3);
        expect(p1.x).to.equal(p2.x);
        expect(p1.y).to.equal(p2.y);
        expect(cb1.callCount).to.equal(2);
        expect(cb2.callCount).to.equal(1);

        p1.x = 10;
        expect(p1.x).to.equal(10);
        expect(p2.x).to.equal(4);

        p2.y = 12;
        expect(p1.x).to.equal(p2.x);
        expect(p1.y).to.equal(p2.y);

        p1.unlink(p2);
        expect(p1._broadcasters.length).to.equal(0);
        expect(p1._listeners.length).to.equal(0);
        expect(p2._listeners.length).to.equal(0);
        expect(p2._broadcasters.length).to.equal(0);

        // bilateral linking
        p1.linkTo(p2);
        p2.linkTo(p1);
        expect(p1._broadcasters.length).to.equal(1);
        expect(p2._listeners.length).to.equal(1);
        expect(p1._listeners.length).to.equal(1);
        expect(p2._broadcasters.length).to.equal(1);
        expect(p1.x).to.equal(p2.x);
        expect(p1.y).to.equal(p2.y);

        p2.y = 40;
        expect(p1.x).to.equal(p2.x);
        expect(p1.y).to.equal(p2.y);

        p1.x = -4;
        expect(p1.x).to.equal(p2.x);
        expect(p1.y).to.equal(p2.y);

        p1.unlinkAll();
        expect(p1._broadcasters.length).to.equal(0);
        expect(p1._listeners.length).to.equal(1);
        expect(p2._listeners.length).to.equal(0);
        expect(p2._broadcasters.length).to.equal(1);

        p2.x = 100;
        expect(p1.x).to.equal(-4);
        p1.x = 50;
        expect(p2.x).to.equal(50);

        p1.linkTo(p2);
        p2.linkTo(p1);
        expect(p1._broadcasters.length).to.equal(1);
        expect(p2._listeners.length).to.equal(1);
        expect(p1._listeners.length).to.equal(1);
        expect(p2._broadcasters.length).to.equal(1);

        p1.detach();
        expect(p1._broadcasters.length).to.equal(0);
        expect(p1._listeners.length).to.equal(0);
        expect(p2._listeners.length).to.equal(0);
        expect(p2._broadcasters.length).to.equal(0);
    });
});
