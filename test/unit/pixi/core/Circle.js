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
});
