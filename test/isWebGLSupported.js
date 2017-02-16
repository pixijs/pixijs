'use strict';

function isWebGLSupported(fn)
{
    return PIXI.utils.isWebGLSupported() ? fn : undefined;
}

module.exports = isWebGLSupported;
