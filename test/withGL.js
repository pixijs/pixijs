'use strict';

function withGL(fn)
{
    return PIXI.utils.isWebGLSupported() ? (fn || true) : undefined;
}

module.exports = withGL;
