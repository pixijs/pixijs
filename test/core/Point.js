'use strict';

describe('PIXI.Point', function ()
{
    it('should create a new point', function ()
    {
        const pt = new PIXI.Point();

        expect(pt.x).to.equal(0);
        expect(pt.y).to.equal(0);
    });

    it('should clone a new point', function ()
    {
        const p1 = new PIXI.Point(10, 20);

        expect(p1.x).to.equal(10);
        expect(p1.y).to.equal(20);

        const p2 = p1.clone();

        expect(p2.x).to.equal(10);
        expect(p2.y).to.equal(20);
        expect(p1).to.not.equal(p2);
        expect(p1.equals(p2)).to.be.true;
    });

    it('should copy from one point to another', function ()
    {
        const p1 = new PIXI.Point(10, 20);
        const p2 = new PIXI.Point(2, 5);

        p1.copy(p2);

        expect(p1.x).to.equal(2);
        expect(p1.y).to.equal(5);
    });

    it('should set a new value', function ()
    {
        const p1 = new PIXI.Point(10, 20);

        p1.set();
        expect(p1.x).to.equal(0);
        expect(p1.y).to.equal(0);

        p1.set(1);
        expect(p1.x).to.equal(1);
        expect(p1.y).to.equal(1);

        p1.set(1, 0);
        expect(p1.x).to.equal(1);
        expect(p1.y).to.equal(0);
    });
});
