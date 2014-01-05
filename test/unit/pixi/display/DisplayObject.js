describe('pixi/display/DisplayObject', function () {
    'use strict';

    var expect = chai.expect;
    var DisplayObject = PIXI.DisplayObject;

    it('Module exists', function () {
        expect(DisplayObject).to.be.a('function');
       // expect(PIXI).to.have.property('visibleCount', 0);
    });

    it('Confirm new instance', function () {
        var obj = new DisplayObject();

        pixi_display_DisplayObject_confirmNew(obj);
        expect(obj).to.have.property('hitArea', null);
        expect(obj).to.have.property('interactive', false);
        expect(obj).to.have.property('renderable', false);
        expect(obj).to.have.property('stage', null);
    });
});
