import { GLShader } from 'pixi-gl-core';
import settings from './settings';

function checkPrecision(src, def)
{
    if (src instanceof Array)
    {
        if (src[0].substring(0, 9) !== 'precision')
        {
            const copy = src.slice(0);

            copy.unshift(`precision ${def} float;`);

            return copy;
        }
    }
    else if (src.substring(0, 9) !== 'precision')
    {
        return `precision ${def} float;\n${src}`;
    }

    return src;
}

/**
 * Wrapper class, webGL Shader for Pixi.
 * Adds precision string if vertexSrc or fragmentSrc have no mention of it.
 *
 * @class
 * @extends GLShader
 * @memberof PIXI
 */
export default class Shader extends GLShader
{
    /**
     *
     * @param {WebGLRenderingContext} gl - The current WebGL rendering context
     * @param {string|string[]} vertexSrc - The vertex shader source as an array of strings.
     * @param {string|string[]} fragmentSrc - The fragment shader source as an array of strings.
     */
    constructor(gl, vertexSrc, fragmentSrc)
    {
        super(gl, checkPrecision(vertexSrc, settings.PRECISION_VERTEX),
            checkPrecision(fragmentSrc, settings.PRECISION_FRAGMENT));
    }
}
