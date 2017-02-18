'use strict';

function withGL(init, fn)
{
    if (!PIXI.utils.isWebGLSupported())
    {
        return undefined;
    }

    const renderer = init();

    try
    {
        return fn(renderer);
    }
    finally
    {
        PIXI.utils.destroyTextureCache();
        renderer.destroy();
    }
}

module.exports = withGL;
