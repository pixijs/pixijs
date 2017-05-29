'use strict';

const withGL = require('../withGL');

describe('PIXI.WebGLRenderer', function ()
{
    it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', withGL(function ()
    {
        const renderer = new PIXI.WebGLRenderer({ legacy: true, width:1, height:1 });

        try
        {
            expect(renderer.geometry.hasVao).to.equal(false);
            expect(renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);
        }
        finally
        {
            renderer.destroy();
        }
    }));
});
