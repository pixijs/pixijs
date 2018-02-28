const { Renderer } = require('../');
const { settings } = require('@pixi/settings');
const { ENV } = require('@pixi/constants');
const { isWebGLSupported, skipHello } = require('@pixi/utils');

skipHello();

function withGL(fn)
{
    return isWebGLSupported() ? fn : undefined;
}

describe('PIXI.Renderer', function ()
{
    it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', withGL(function ()
    {
        settings.PREFER_ENV = ENV.WEBGL_LEGACY;
        const renderer = new Renderer(1, 1);

        try
        {
            expect(renderer.geometry.hasVao).to.equal(false);
            // expect(renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);
        }
        finally
        {
            renderer.destroy();
        }
        settings.PREFER_ENV = ENV.WEBGL2;
    }));

    it('should allow clear() to work despite no containers added to the renderer', withGL(function ()
    {
        const renderer = new Renderer(1, 1);

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
