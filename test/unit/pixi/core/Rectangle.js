describe('pixi/core/Rectangle', function () {
    'use strict';

    var expect = chai.expect;
    var Rectangle = PIXI.Rectangle;

    it('Module exists', function () {
        expect(Rectangle).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new Rectangle();
        pixi_core_Rectangle_confirm(obj, 0, 0, 0, 0);
    });

    it('clone', function () {
        var obj = new Rectangle(10, 30, 100, 200);
        var clone = obj.clone();

        expect(clone === obj).to.be.false;
        pixi_core_Rectangle_confirm(obj, 10, 30, 100, 200);
    });

    // it('contains', function () {
    //     var obj = new Rectangle(0, 0, 50, 100);
    //     expect(obj.contains(0, 0)).to.be.true;   // center
    //     expect(obj.contains(0, -50)).to.be.true; // top
    //     expect(obj.contains(25, 0)).to.be.true;  // right
    //     expect(obj.contains(0, 50)).to.be.true;  // bottom
    //     expect(obj.contains(-25, 0)).to.be.true; // left
    // });

    it('contains and no size', function () {
        var obj = new Rectangle();
        expect(obj.contains(0, 0)).to.be.false;
    });
});
