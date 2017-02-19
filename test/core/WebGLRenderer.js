'use strict';

const withGL = require('../withGL');

describe('PIXI.WebGLRenderer', function ()
{
    it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', withGL(function ()
    {
        const renderer = new PIXI.WebGLRenderer(1, 1, { legacy: true });

        try
        {
            expect(PIXI.glCore.VertexArrayObject.FORCE_NATIVE).to.equal(true);
            expect(renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);
        }
        finally
        {
            renderer.destroy();
        }
    }));
});
