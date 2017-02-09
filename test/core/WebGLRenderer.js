'use strict';

function isWebGLSupported(fn)
{
    return PIXI.utils.isWebGLSupported() ? fn : undefined;
}

describe('PIXI.WebGLRenderer', function ()
{
    it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', isWebGLSupported(function ()
    {
        const renderer = new PIXI.WebGLRenderer(1, 1, { legacy: true });

        expect(PIXI.glCore.VertexArrayObject.FORCE_NATIVE).to.equal(true);
        expect(renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);

        renderer.destroy();
    }));
});
