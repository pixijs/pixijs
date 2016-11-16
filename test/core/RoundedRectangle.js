'use strict';

describe('PIXI.RoundedRectangle', function ()
{
    it('should create a new rounded rectangle', function ()
    {
        const rrect = new PIXI.RoundedRectangle(5, 5, 1, 1);

        expect(rrect.x).to.equal(5);
        expect(rrect.y).to.equal(5);
        expect(rrect.width).to.equal(1);
        expect(rrect.height).to.equal(1);
        expect(rrect.radius).to.equal(20);
    });

    it('should clone a new rounded rectangle', function ()
    {
        const rrect1 = new PIXI.RoundedRectangle(0, 0, 100, 100, 40);

        expect(rrect1.x).to.equal(0);
        expect(rrect1.y).to.equal(0);
        expect(rrect1.width).to.equal(100);
        expect(rrect1.height).to.equal(100);
        expect(rrect1.radius).to.equal(40);

        const rrect2 = rrect1.clone();

        expect(rrect2.x).to.equal(0);
        expect(rrect2.y).to.equal(0);
        expect(rrect2.width).to.equal(100);
        expect(rrect2.height).to.equal(100);
        expect(rrect2.radius).to.equal(40);
        expect(rrect1).to.not.equal(rrect2);
    });

    it('should check if point is within rounded rectangle', function ()
    {
        const rrect1 = new PIXI.RoundedRectangle(0, 0, 200, 200, 50);

        expect(rrect1.contains(50, 50)).to.be.true;
        expect(rrect1.contains(5, 100)).to.be.true;
        expect(rrect1.contains(100, 5)).to.be.true;
        expect(rrect1.contains(195, 100)).to.be.true;
        expect(rrect1.contains(100, 195)).to.be.true;
        expect(rrect1.contains(20, 20)).to.be.true;
        expect(rrect1.contains(180, 20)).to.be.true;
        expect(rrect1.contains(180, 180)).to.be.true;
        expect(rrect1.contains(20, 180)).to.be.true;
        expect(rrect1.contains(10, 10)).to.be.false;
        expect(rrect1.contains(190, 10)).to.be.false;
        expect(rrect1.contains(190, 190)).to.be.false;
        expect(rrect1.contains(10, 190)).to.be.false;

        const rrect2 = new PIXI.RoundedRectangle(0, 0, 10, 0, 1);

        expect(rrect2.contains(0, 0)).to.be.false;

        const rrect3 = new PIXI.RoundedRectangle(0, 0, 0, 10, 1);

        expect(rrect3.contains(0, 0)).to.be.false;
    });
});
