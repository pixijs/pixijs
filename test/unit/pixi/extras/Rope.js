describe('pixi/extras/Rope', function () {
    'use strict';

    var expect = chai.expect;
    var Rope = PIXI.Rope;
    var Texture = PIXI.Texture;
    var Point = PIXI.Point;

    it('Module exists', function () {
        expect(Rope).to.be.a('function');
    });

    it('Confirm new instance', function () {
	
        var texture = Texture.fromImage('/base/test/textures/bunny.png');

        // TODO-Alvin 
        // Same as Strip

        // var obj = new Rope(texture, [new Point(), new Point(5, 10), new Point(10, 20)]);

        // pixi_extras_Strip_confirmNew(obj);

        // expect(obj).to.be.an.instanceof(Rope);
        // expect(obj).to.respondTo('refresh');
        // expect(obj).to.respondTo('updateTransform');
        // expect(obj).to.respondTo('setTexture');

        // TODO: Test properties
    });
});
