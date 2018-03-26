'use strict';

describe('PIXI.Ellipse', function ()
{
    it('should create a new ellipse', function ()
    {
        const ellipse1 = new PIXI.Ellipse();

        expect(ellipse1.x).to.equal(0);
        expect(ellipse1.y).to.equal(0);
        expect(ellipse1.width).to.equal(0);
        expect(ellipse1.height).to.equal(0);

        const ellipse2 = new PIXI.Ellipse(10, 10, 5, 5);

        expect(ellipse2.x).to.equal(10);
        expect(ellipse2.y).to.equal(10);
        expect(ellipse2.width).to.equal(5);
        expect(ellipse2.height).to.equal(5);
    });

    it('should clone a new ellipse', function ()
    {
        const ellipse1 = new PIXI.Ellipse(10, 10, 5, 5);

        expect(ellipse1.x).to.equal(10);
        expect(ellipse1.y).to.equal(10);
        expect(ellipse1.width).to.equal(5);
        expect(ellipse1.height).to.equal(5);

        const ellipse2 = ellipse1.clone();

        expect(ellipse2.x).to.equal(10);
        expect(ellipse2.y).to.equal(10);
        expect(ellipse2.width).to.equal(5);
        expect(ellipse2.height).to.equal(5);
    });

    it('should check if point is within ellipse', function ()
    {
        const ellipse1 = new PIXI.Ellipse(10, 10, 5, 5);

        expect(ellipse1.contains(10, 10)).to.be.true;
        expect(ellipse1.contains(10, 15)).to.be.true;
        expect(ellipse1.contains(15, 10)).to.be.true;
        expect(ellipse1.contains(5, 10)).to.be.true;
        expect(ellipse1.contains(15, 10)).to.be.true;

        expect(ellipse1.contains(6, 7)).to.be.true;
        expect(ellipse1.contains(7, 6)).to.be.true;
        expect(ellipse1.contains(7, 7)).to.be.true;
        expect(ellipse1.contains(13, 14)).to.be.true;
        expect(ellipse1.contains(14, 13)).to.be.true;

        expect(ellipse1.contains(14, 14)).to.be.false;
        expect(ellipse1.contains(10, 16)).to.be.false;
        expect(ellipse1.contains(11, 15)).to.be.false;
        expect(ellipse1.contains(0, 0)).to.be.false;

        const ellipse2 = new PIXI.Ellipse(10, 10, 0, 0);

        expect(ellipse2.contains(10, 10)).to.be.false;
    });

    it('should return framing rectangle', function ()
    {
        const ellipse1 = new PIXI.Ellipse(10, 10, 5, 5);
        const rect1 = ellipse1.getBounds();

        expect(rect1.left).to.equal(5);
        expect(rect1.top).to.equal(5);
        expect(rect1.right).to.equal(10);
        expect(rect1.bottom).to.equal(10);
    });
});
