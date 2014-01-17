describe('pixi/core/Polygon', function () {
    'use strict';

    var expect = chai.expect;
    var Polygon = PIXI.Polygon;

    it('Module exists', function () {
        expect(Polygon).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new Polygon(0,0 ,0,1, 1,1, 1,0);

        expect(obj).to.be.an.instanceof(Polygon);
        expect(obj).to.respondTo('clone');
        expect(obj).to.respondTo('contains');

        expect(obj).to.have.deep.property('points.length', 4);
    });

    it('clone', function () {
        var obj = new Polygon(0,0 ,0,1, 1,1, 1,0);
        var clone = obj.clone();

        expect(clone === obj).to.be.false;
        expect(clone.points === obj.points).to.be.false;
        expect(clone.points[3] === obj.points[3]).to.be.false;
        expect(clone.points.length === obj.points.length).to.be.true;

        expect(clone.points[0].x === obj.points[0].x).to.be.true;
        expect(clone.points[0].y === obj.points[0].y).to.be.true;
        expect(clone.points[1].x === obj.points[1].x).to.be.true;
        expect(clone.points[1].y === obj.points[1].y).to.be.true;
        expect(clone.points[2].x === obj.points[2].x).to.be.true;
        expect(clone.points[2].y === obj.points[2].y).to.be.true;
        expect(clone.points[3].x === obj.points[3].x).to.be.true;
        expect(clone.points[3].y === obj.points[3].y).to.be.true;
    });

    it('contains and no size', function () {
        var obj = new Polygon();
        expect(obj.contains(0, 0)).to.be.false;
    });
});
