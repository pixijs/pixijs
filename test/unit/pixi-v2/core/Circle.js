describe('pixi/core/Circle', function () {
    'use strict';

    var expect = chai.expect;
    var Circle = PIXI.Circle;

    it('Module exists', function () {
        expect(Circle).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new Circle();
        pixi_core_Circle_confirmNewCircle(obj);
    });

    it("getBounds should return Rectangle that bounds the circle", function() {
        var obj = new Circle(100, 250, 50);
        var bounds = obj.getBounds();
        pixi_core_Circle_isBoundedByRectangle(obj, bounds);
    });
});
