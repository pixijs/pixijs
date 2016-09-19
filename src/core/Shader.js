import {GLShader} from 'pixi-gl-core';
import Const from './const';

function checkPrecision(src)
{
    if (src instanceof Array)
    {
        if (src[0].substring(0,9) !== 'precision')
        {
            const copy = src.slice(0);
            copy.unshift(`precision ${Const.PRECISION.DEFAULT} float;`);
            return copy;
        }
    }
    else
    {
        if (src.substring(0,9) !== 'precision')
        {
            return `precision ${Const.PRECISION.DEFAULT} float;\n${src}`;
        }
    }
    return src;
}

/**
 * Wrapper class, webGL Shader for Pixi.
 * Adds precision string if vertexSrc or fragmentSrc have no mention of it.
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 */
class Shader extends GLShader
{
    constructor(gl, vertexSrc, fragmentSrc)
    {
        super(gl, checkPrecision(vertexSrc), checkPrecision(fragmentSrc));
    }
}

export default Shader;
