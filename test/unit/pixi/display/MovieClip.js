describe('pixi/display/MovieClip', function () {
    'use strict';

    var expect = chai.expect;
    var MovieClip = PIXI.MovieClip;
    var Texture = PIXI.Texture;

    it('Module exists', function () {
        expect(MovieClip).to.be.a('function');
    });

    it('Confirm new instance', function (done) {
        var texture = Texture.fromImage('/base/test/textures/SpriteSheet-Explosion.png');
        var obj = new MovieClip([texture]);

        pixi_display_Sprite_confirmNew(obj, done);

        expect(obj).to.be.an.instanceof(MovieClip);
        expect(obj).to.respondTo('stop');
        expect(obj).to.respondTo('play');
        expect(obj).to.respondTo('gotoAndStop');
        expect(obj).to.respondTo('gotoAndPlay');
        expect(obj).to.respondTo('updateTransform');

        expect(obj).to.have.deep.property('textures.length', 1);
        expect(obj).to.have.deep.property('textures[0]', texture);
        expect(obj).to.have.property('animationSpeed', 1);
        expect(obj).to.have.property('loop', true);
        expect(obj).to.have.property('onComplete', null);
        expect(obj).to.have.property('currentFrame', 0);
        expect(obj).to.have.property('playing', false);
    });
});
