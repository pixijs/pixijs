describe('pixi/core/Point', function () {
    'use strict';

    var expect = chai.expect;
    var Point = PIXI.Point;

    it('Module exists', function () {
        expect(Point).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new Point();
        pixi_core_Point_confirm(obj, 0, 0);
    });


    it('Can add two points', function () {
        var PX1 = new Point(1,0);
        var PY1 = new Point(0,1);
        var PX1Y1 = new Point(1,1);

        expect(PX1).to.respondTo('add');

        var PT = PX1.add(PY1);
        expect(PT.x).to.equal(1);
        expect(PT.y).to.equal(1);
        //expect(PT).to.equal(PX1Y1);
    });
});
