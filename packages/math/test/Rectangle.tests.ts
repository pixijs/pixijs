import { Rectangle } from '@pixi/math';
import { expect } from 'chai';

describe('Rectangle', function ()
{
    it('should create a new rectangle', function ()
    {
        const rect = new Rectangle(5, 5, 1, 1);

        expect(rect.left).to.equal(5);
        expect(rect.top).to.equal(5);
        expect(rect.right).to.equal(6);
        expect(rect.bottom).to.equal(6);
    });

    it('should cast quantities to number types', function ()
    {
        const rect = new Rectangle('5', '5', '1', '1');

        expect(rect.left).to.equal(5);
        expect(rect.top).to.equal(5);
        expect(rect.right).to.equal(6);
        expect(rect.bottom).to.equal(6);
    });

    it('should clone a new rectangle', function ()
    {
        const rect1 = new Rectangle(10, 10, 10, 10);

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
        const rect1 = new Rectangle(10, 10, 10, 10);
        const rect2 = new Rectangle(2, 2, 5, 5);

        rect1.copyFrom(rect2);

        expect(rect1.x).to.equal(2);
        expect(rect1.y).to.equal(2);
        expect(rect1.width).to.equal(5);
        expect(rect1.height).to.equal(5);
    });

    it('should check if point is within rectangle', function ()
    {
        const rect1 = new Rectangle(10, 10, 10, 10);

        expect(rect1.contains(10, 10)).to.be.true;
        expect(rect1.contains(10, 19)).to.be.true;
        expect(rect1.contains(19, 10)).to.be.true;
        expect(rect1.contains(15, 15)).to.be.true;
        expect(rect1.contains(10, 9)).to.be.false;
        expect(rect1.contains(9, 10)).to.be.false;
        expect(rect1.contains(10, 20)).to.be.false;
        expect(rect1.contains(20, 10)).to.be.false;
        expect(rect1.contains(21, 21)).to.be.false;

        const rect2 = new Rectangle(10, 10, 10, 0);

        expect(rect2.contains(10, 10)).to.be.false;
        expect(rect2.contains(20, 20)).to.be.false;
        expect(rect2.contains(15, 15)).to.be.false;
        expect(rect2.contains(10, 9)).to.be.false;
        expect(rect2.contains(9, 10)).to.be.false;
        expect(rect2.contains(21, 21)).to.be.false;
    });

    it('should enlarge rectangle', function ()
    {
        const rect1 = new Rectangle(10, 10, 10, 10);
        const rect2 = new Rectangle(15, 15, 10, 10);

        rect1.enlarge(rect2);

        expect(rect1.left).to.equal(10);
        expect(rect1.top).to.equal(10);
        expect(rect1.right).to.equal(25);
        expect(rect1.bottom).to.equal(25);

        const rect3 = new Rectangle(0, 0, 0, 0);
        const rect4 = new Rectangle(10, 10, 10, 10);

        rect4.enlarge(rect3);

        expect(rect4.left).to.equal(0);
        expect(rect4.top).to.equal(0);
        expect(rect4.right).to.equal(20);
        expect(rect4.bottom).to.equal(20);
    });

    it('should pad a rectangle', function ()
    {
        // Pad with X & Y
        const rect = new Rectangle(10, 10, 10, 10);

        rect.pad(10, 10);

        expect(rect.left).to.equal(0);
        expect(rect.top).to.equal(0);
        expect(rect.right).to.equal(30);
        expect(rect.bottom).to.equal(30);

        // Pad with X
        const rect1 = new Rectangle(10, 10, 10, 10);

        rect1.pad(10);

        expect(rect1.left).to.equal(0);
        expect(rect1.top).to.equal(0);
        expect(rect1.right).to.equal(30);
        expect(rect1.bottom).to.equal(30);

        // Pad with nothing
        const rect2 = new Rectangle(10, 10, 10, 10);

        rect2.pad();

        expect(rect2.left).to.equal(10);
        expect(rect2.top).to.equal(10);
        expect(rect2.right).to.equal(20);
        expect(rect2.bottom).to.equal(20);

        // Pad with Y
        const rect3 = new Rectangle(10, 10, 10, 10);

        rect3.pad(null, 10);

        expect(rect3.left).to.equal(10);
        expect(rect3.top).to.equal(0);
        expect(rect3.right).to.equal(20);
        expect(rect3.bottom).to.equal(30);
    });

    it('should fit a rectangle', function ()
    {
        const rect1 = new Rectangle(0, 0, 10, 10);
        const rect2 = new Rectangle(-10, -10, 5, 5);

        rect2.fit(rect1);

        expect(rect2.left).to.equal(0);
        expect(rect2.top).to.equal(0);
        expect(rect2.right).to.equal(0);
        expect(rect2.bottom).to.equal(0);

        const rect3 = new Rectangle(0, 0, 20, 20);
        const rect4 = new Rectangle(10, 0, 20, 20);

        rect3.fit(rect4);

        expect(rect3.left).to.equal(10);
        expect(rect3.top).to.equal(0);
        expect(rect3.right).to.equal(20);
        expect(rect3.bottom).to.equal(20);

        const rect5 = new Rectangle(10, 10, 20, 25);
        const rect6 = new Rectangle(22, 24, 20, 20);

        rect5.fit(rect6);

        expect(rect5.left).to.equal(22);
        expect(rect5.top).to.equal(24);
        expect(rect5.right).to.equal(30);
        expect(rect5.bottom).to.equal(35);

        const rect7 = new Rectangle(11, 10, 20, 25);
        const rect8 = new Rectangle(10, 9, 13, 10);

        rect7.fit(rect8);

        expect(rect7.left).to.equal(11);
        expect(rect7.top).to.equal(10);
        expect(rect7.right).to.equal(23);
        expect(rect7.bottom).to.equal(19);
    });

    it('should generate an empty rectangle', function ()
    {
        const rect = Rectangle.EMPTY;

        expect(rect.left).to.equal(0);
        expect(rect.top).to.equal(0);
        expect(rect.right).to.equal(0);
        expect(rect.bottom).to.equal(0);
    });
});
