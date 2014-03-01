describe('pixi/extras/TransparencyHitArea', function () {
    'use strict';

    var expect = chai.expect;
    var TransparencyHitArea = PIXI.TransparencyHitArea;
    var CanvasTransparencyHitArea = PIXI.CanvasTransparencyHitArea;
    var WebGLTransparencyHitArea = PIXI.WebGLTransparencyHitArea;

    it('Module exists', function () {
        expect(TransparencyHitArea).to.be.a('function');
        expect(CanvasTransparencyHitArea).to.be.a('function');
        expect(WebGLTransparencyHitArea).to.be.a('function');
    });

    it('Members exist',  function () {
        expect(TransparencyHitArea).itself.to.respondTo('create');
        expect(TransparencyHitArea).to.respondTo('contains');
        expect(TransparencyHitArea).to.respondTo('init');
        expect(CanvasTransparencyHitArea).to.respondTo('isTextureTransparentAt');
        expect(CanvasTransparencyHitArea).to.respondTo('init');
        expect(CanvasTransparencyHitArea).to.respondTo('clone');
        expect(WebGLTransparencyHitArea).to.respondTo('isTextureTransparentAt');
        expect(WebGLTransparencyHitArea).to.respondTo('init');
        expect(WebGLTransparencyHitArea).to.respondTo('clone');
    });

    it('Confirm new Canvas instance', function (done) {
        var texture = PIXI.Texture.fromImage('/base/test/textures/bunny.png');

        var testWhenLoaded = function () {
            var sprite = new PIXI.Sprite(texture);
            var hitArea = TransparencyHitArea.create(sprite, false);
            pixi_extras_TransparencyHitArea_confirmCanvasNew(hitArea);

            expect(hitArea.contains(0,0)).to.equal(false);
            expect(hitArea.contains(7,15)).to.equal(true);

            done();
        };

        if (texture.baseTexture.hasLoaded) {
            testWhenLoaded();
        } else {
            texture.baseTexture.addEventListener('loaded', testWhenLoaded);
        }
    });

    it('Confirm new WebGL instance', function (done) {
        var texture = PIXI.Texture.fromImage('/base/test/textures/bunny.png');

        var testWhenLoaded = function () {
            var sprite = new PIXI.Sprite(texture);
            var hitArea = TransparencyHitArea.create(sprite, true);
            pixi_extras_TransparencyHitArea_confirmWebGLNew(hitArea);

            expect(hitArea.contains(0,0)).to.equal(false);
            expect(hitArea.contains(7,15)).to.equal(true);

            done();
        };

        if (texture.baseTexture.hasLoaded) {
            testWhenLoaded();
        } else {
            texture.baseTexture.addEventListener('loaded', testWhenLoaded);
        }
    });
});
