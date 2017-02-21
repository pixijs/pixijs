'use strict';

describe('PIXI.Circle', function ()
{
    it('should create a new circle', function ()
    {
        const circ1 = new PIXI.Circle();

        expect(circ1.x).to.equal(0);
        expect(circ1.y).to.equal(0);
        expect(circ1.radius).to.equal(0);

        const circ2 = new PIXI.Circle(10, 10, 5);

        expect(circ2.x).to.equal(10);
        expect(circ2.y).to.equal(10);
        expect(circ2.radius).to.equal(5);
    });

    it('should clone a new circle', function ()
    {
        const circ1 = new PIXI.Circle(10, 10, 5);

        expect(circ1.x).to.equal(10);
        expect(circ1.y).to.equal(10);
        expect(circ1.radius).to.equal(5);

        const circ2 = circ1.clone();

        expect(circ2.x).to.equal(10);
        expect(circ2.y).to.equal(10);
        expect(circ2.radius).to.equal(5);
        expect(circ1).to.not.equal(circ2);
    });

    it('should check if point is within circle', function ()
    {
        const circ1 = new PIXI.Circle(10, 10, 5);

        expect(circ1.contains(10, 10)).to.be.true;
        expect(circ1.contains(10, 15)).to.be.true;
        expect(circ1.contains(15, 10)).to.be.true;
        expect(circ1.contains(5, 10)).to.be.true;
        expect(circ1.contains(15, 10)).to.be.true;

        expect(circ1.contains(6, 7)).to.be.true;
        expect(circ1.contains(7, 6)).to.be.true;
        expect(circ1.contains(7, 7)).to.be.true;
        expect(circ1.contains(13, 14)).to.be.true;
        expect(circ1.contains(14, 13)).to.be.true;

        expect(circ1.contains(14, 14)).to.be.false;
        expect(circ1.contains(10, 16)).to.be.false;
        expect(circ1.contains(11, 15)).to.be.false;
        expect(circ1.contains(0, 0)).to.be.false;

        const circ2 = new PIXI.Circle(10, 10, 0);

        expect(circ2.contains(10, 10)).to.be.false;
    });

    it('should return framing rectangle', function ()
    {
        const circ1 = new PIXI.Circle(10, 10, 5);
        const rect1 = circ1.getBounds();

        expect(rect1.left).to.equal(5);
        expect(rect1.top).to.equal(5);
        expect(rect1.right).to.equal(15);
        expect(rect1.bottom).to.equal(15);
    });
});
