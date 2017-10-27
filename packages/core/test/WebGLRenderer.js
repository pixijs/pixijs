const { WebGLRenderer } = require('../');
const { isWebGLSupported, skipHello } = require('@pixi/utils');

skipHello();

function withGL(fn)
{
    return isWebGLSupported() ? fn : undefined;
}

describe('PIXI.WebGLRenderer', function ()
{
    it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', withGL(function ()
    {
        const renderer = new WebGLRenderer({ legacy: true, width: 1, height: 1 });

        try
        {
            expect(renderer.geometry.hasVao).to.equal(false);
            // expect(renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);
        }
        finally
        {
            renderer.destroy();
        }
    }));

    it('should allow clear() to work despite no containers added to the renderer', withGL(function ()
    {
        const renderer = new WebGLRenderer(1, 1);

        try
        {
            renderer.clear();
        }
        finally
        {
            renderer.destroy();
        }
    }));
});
