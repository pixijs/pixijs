describe('pixi/display/DisplayObjectContainer', function () {
    'use strict';

    var expect = chai.expect;
    var DisplayObjectContainer = PIXI.DisplayObjectContainer;

    it('Module exists', function () {
        expect(DisplayObjectContainer).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new DisplayObjectContainer();

        pixi_display_DisplayObjectContainer_confirmNew(obj);
        expect(obj).to.have.property('hitArea', null);
        expect(obj).to.have.property('interactive', false);
        expect(obj).to.have.property('renderable', false);
        expect(obj).to.have.property('stage', null);
    });
});
