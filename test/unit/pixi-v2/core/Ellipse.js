describe('pixi/core/Ellipse', function () {
    'use strict';

    var expect = chai.expect;
    var Ellipse = PIXI.Ellipse;

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
});
