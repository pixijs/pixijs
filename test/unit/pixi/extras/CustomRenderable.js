describe('pixi/extras/CustomRenderable', function () {
    'use strict';

    var expect = chai.expect;
    var CustomRenderable = PIXI.CustomRenderable;

    it('Module exists', function () {
        expect(CustomRenderable).to.be.a('function');
    });

    it('Confirm new instance', function () {
        var obj = new CustomRenderable();

        pixi_display_DisplayObject_confirmNew(obj);

        expect(obj).to.be.an.instanceof(CustomRenderable);
        expect(obj).to.respondTo('renderCanvas');
        expect(obj).to.respondTo('initWebGL');
        expect(obj).to.respondTo('renderWebGL');
    });
});
