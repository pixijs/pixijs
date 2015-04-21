describe('pixi/core/Rectangle', function () {
    'use strict';

    var expect = chai.expect;
    var Rectangle = PIXI.Rectangle;

    it('Module exists', function () {
        expect(Rectangle).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var rect = new Rectangle();
        pixi_core_Rectangle_confirm(rect, 0, 0, 0, 0);
    });
});
