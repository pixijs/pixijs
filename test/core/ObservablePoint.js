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

        p1.on('change', changeListener1);
        p1.x += 1;
        expect(cb.callCount).to.equal(1);
        expect(changeListener1.callCount).to.equal(1);
        expect(changeListener1.calledWith(11, 20)).to.be.true;

        p1.set(2, 2);
        expect(cb.callCount).to.equal(2);
        expect(changeListener1.callCount).to.equal(2);
        expect(changeListener1.calledWith(2, 2)).to.be.true;

        p1.off('change', changeListener1);
        p1.on('change', changeListener1);
        p1.on('change', changeListener2);

        p1.y += 2;
        expect(cb.callCount).to.equal(3);
        expect(changeListener1.callCount).to.equal(3);
        expect(changeListener2.callCount).to.equal(1);
        expect(changeListener1.calledWith(2, 4)).to.be.true;
        expect(changeListener2.calledWith(2, 4)).to.be.true;

        p1.removeAllListeners();
        p1.y -= 2;
        expect(cb.callCount).to.equal(4);
        expect(changeListener1.callCount).to.equal(3);
        expect(changeListener2.callCount).to.equal(1);
    });
});
