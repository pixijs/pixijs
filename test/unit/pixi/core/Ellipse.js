describe('pixi/core/Ellipse', function () {
    'use strict';

    var expect = chai.expect;
    var Ellipse = PIXI.Ellipse;
    var Rectangle = PIXI.Rectangle;

    it('Module exists', function () {
        expect(Ellipse).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new Ellipse();

        expect(obj).to.be.an.instanceof(Ellipse);
        expect(obj).to.respondTo('clone');
        expect(obj).to.respondTo('contains');
        expect(obj).to.respondTo('getBounds');

        expect(obj).to.have.property('x', 0);
        expect(obj).to.have.property('y', 0);
        expect(obj).to.have.property('width', 0);
        expect(obj).to.have.property('height', 0);
    });

    it('clone', function () {
        var obj = new Ellipse(10, 30, 50, 100);
        var clone = obj.clone();

        expect(clone === obj).to.be.false;
        expect(clone.x).to.equal(10);
        expect(clone.y).to.equal(30);
        expect(clone.width).to.equal(50);
        expect(clone.height).to.equal(100);
    });

    // it('contains', function () {
    //     var obj = new Ellipse(0, 0, 50, 100);
    //     expect(obj.contains(0, 0)).to.be.true;   // center
    //     expect(obj.contains(0, -50)).to.be.true; // top
    //     expect(obj.contains(25, 0)).to.be.true;  // right
    //     expect(obj.contains(0, 50)).to.be.true;  // bottom
    //     expect(obj.contains(-25, 0)).to.be.true; // left
    // });

    // it('contains in quads', function () {
    //     var obj = new Ellipse(0, 0, 50, 100);
    //     expect(obj.contains(-35, -35)).to.be.true; // top-left
    //     expect(obj.contains(35, -35)).to.be.true; // top-right
    //     expect(obj.contains(35, 35)).to.be.true; // bottom-right
    //     expect(obj.contains(-35, 35)).to.be.true; // bottom-left
    // });

    // it('does not contain', function () {
    //     var obj = new Ellipse(0, 0, 50, 100);
    //     expect(obj.contains(-36, -36)).to.be.false; // top-left
    //     expect(obj.contains(36, -36)).to.be.false; // top-right
    //     expect(obj.contains(36, 36)).to.be.false; // bottom-right
    //     expect(obj.contains(-36, 36)).to.be.false; // bottom-left
    // });

    it('contains and no size', function () {
        var obj = new Ellipse();
        expect(obj.contains(0, 0)).to.be.false;
    });

    it('getBounds', function () {
        var obj = new Ellipse(0, 0, 50, 100);
        var bounds = obj.getBounds();
        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(50);
        expect(bounds.height).to.equal(100);
    });
});
