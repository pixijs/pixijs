describe('pixi/core/Circle', function () {
    'use strict';

    var expect = chai.expect;
    var Circle = PIXI.Circle;

    it('Module exists', function () {
        expect(Circle).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new Circle();

        expect(obj).to.be.an.instanceof(Circle);
        expect(obj).to.respondTo('clone');
        expect(obj).to.respondTo('contains');

        expect(obj).to.have.property('x', 0);
        expect(obj).to.have.property('y', 0);
        expect(obj).to.have.property('radius', 0);
    });

    it('clone', function () {
        var obj = new Circle(10, 30, 100);
        var clone = obj.clone();

        expect(clone === obj).to.be.false;
        expect(clone.x).to.equal(10);
        expect(clone.y).to.equal(30);
        expect(clone.radius).to.equal(100);
    });

    it('contains', function () {
        var obj = new Circle(0, 0, 50);
        expect(obj.contains(0, 0)).to.be.true;   // center
        expect(obj.contains(0, -50)).to.be.true; // top
        expect(obj.contains(50, 0)).to.be.true;  // right
        expect(obj.contains(0, 50)).to.be.true;  // bottom
        expect(obj.contains(-50, 0)).to.be.true; // left
    });

    it('contains in quads', function () {
        var obj = new Circle(0, 0, 50);
        expect(obj.contains(-35, -35)).to.be.true; // top-left
        expect(obj.contains(35, -35)).to.be.true; // top-right
        expect(obj.contains(35, 35)).to.be.true; // bottom-right
        expect(obj.contains(-35, 35)).to.be.true; // bottom-left
    });

    it('does not contain', function () {
        var obj = new Circle(0, 0, 50);
        expect(obj.contains(-36, -36)).to.be.false; // top-left
        expect(obj.contains(36, -36)).to.be.false; // top-right
        expect(obj.contains(36, 36)).to.be.false; // bottom-right
        expect(obj.contains(-36, 36)).to.be.false; // bottom-left
    });

    it('contains and no radius', function () {
        var obj = new Circle();
        expect(obj.contains(0, 0)).to.be.false;
    });
});
