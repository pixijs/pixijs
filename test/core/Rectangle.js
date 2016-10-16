'use strict';

describe('PIXI.Rectangle', function ()
{
    it('should create a new rectangle', function ()
    {
        const rect = new PIXI.Rectangle(5, 5, 1, 1);

        expect(rect.left).to.equal(5);
        expect(rect.top).to.equal(5);
        expect(rect.right).to.equal(6);
        expect(rect.bottom).to.equal(6);
    });

    it('should clone a new rectangle', function ()
    {
        const rect1 = new PIXI.Rectangle(10, 10, 10, 10);

        expect(rect1.x).to.equal(10);
        expect(rect1.y).to.equal(10);
        expect(rect1.width).to.equal(10);
        expect(rect1.height).to.equal(10);

        const rect2 = rect1.clone();

        expect(rect2.x).to.equal(10);
        expect(rect2.y).to.equal(10);
        expect(rect2.width).to.equal(10);
        expect(rect2.height).to.equal(10);
        expect(rect1).to.not.equal(rect2);
    });

    it('should copy from one rectangle to another', function ()
    {
        const rect1 = new PIXI.Rectangle(10, 10, 10, 10);
        const rect2 = new PIXI.Rectangle(2, 2, 5, 5);

        rect1.copy(rect2);

        expect(rect1.x).to.equal(2);
        expect(rect1.y).to.equal(2);
        expect(rect1.width).to.equal(5);
        expect(rect1.height).to.equal(5);
    });

    it('should check if point is within rectangle', function ()
    {
        const rect1 = new PIXI.Rectangle(10, 10, 10, 10);

        expect(rect1.contains(10, 10)).to.be.true;
        expect(rect1.contains(10, 19)).to.be.true;
        expect(rect1.contains(19, 10)).to.be.true;
        expect(rect1.contains(15, 15)).to.be.true;
        expect(rect1.contains(10, 9)).to.be.false;
        expect(rect1.contains(9, 10)).to.be.false;
        expect(rect1.contains(10, 20)).to.be.false;
        expect(rect1.contains(20, 10)).to.be.false;
        expect(rect1.contains(21, 21)).to.be.false;

        const rect2 = new PIXI.Rectangle(10, 10, 10, 0);

        expect(rect2.contains(10, 10)).to.be.false;
        expect(rect2.contains(20, 20)).to.be.false;
        expect(rect2.contains(15, 15)).to.be.false;
        expect(rect2.contains(10, 9)).to.be.false;
        expect(rect2.contains(9, 10)).to.be.false;
        expect(rect2.contains(21, 21)).to.be.false;
    });

    it('should make rectangle grow', function ()
    {
        const rect = new PIXI.Rectangle(10, 10, 10, 10);

        rect.pad(1, 1);

        expect(rect.left).to.equal(9);
        expect(rect.top).to.equal(9);
        expect(rect.right).to.equal(21);
        expect(rect.bottom).to.equal(21);

        rect.pad(10, 10);

        expect(rect.left).to.equal(-1);
        expect(rect.top).to.equal(-1);
        expect(rect.right).to.equal(31);
        expect(rect.bottom).to.equal(31);
    });

    it('should enlarge rectangle', function ()
    {
        const rect1 = new PIXI.Rectangle(10, 10, 10, 10);
        const rect2 = new PIXI.Rectangle(15, 15, 10, 10);

        rect1.enlarge(rect2);

        expect(rect1.left).to.equal(10);
        expect(rect1.top).to.equal(10);
        expect(rect1.right).to.equal(25);
        expect(rect1.bottom).to.equal(25);
    });
});
