describe('pixi/core/Polygon', function () {
    'use strict';

    var expect = chai.expect;
    var Polygon = PIXI.Polygon;

    it('Module exists', function () {
        expect(Polygon).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new Polygon();

        expect(obj).to.be.an.instanceof(Polygon);
        expect(obj).to.respondTo('clone');
        expect(obj).to.respondTo('contains');

        expect(obj).to.have.deep.property('points.length', 0);
    });
});
