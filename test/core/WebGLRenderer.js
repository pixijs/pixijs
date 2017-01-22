'use strict';

describe('PIXI.WebGLRenderer', function ()
{
    it('setting option legacy should disable VAOs and set minimum SPRITE_MAX_TEXTURES to 1', function (done)
    {
        var renderer = new PIXI.WebGLRenderer(1, 1, { legacy: true });

        expect(PIXI.glCore.VertexArrayObject.FORCE_NATIVE).to.equal(true);
        expect(renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);

        done();
    });
});
