'use strict';

function withGL(fn)
{
    return PIXI.utils.isWebGLSupported() ? fn : undefined;
}

module.exports = withGL;
