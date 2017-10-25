import compileProgram from './shader/compileProgram';
import extractAttributes from './shader/extractAttributes';
import extractUniforms from './shader/extractUniforms';
import setPrecision from './shader/setPrecision';
import generateUniformAccessObject from './shader/generateUniformAccessObject';

let ID = 0;

/**
 * @namespace PIXI.glCore
 */

/**
 * Helper class to create a webGL Shader
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext}
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 * @param precision {string} The float precision of the shader. Options are 'lowp', 'mediump' or 'highp'.
 * @param attributeLocations {object} A key value pair showing which location eact
 * attribute should sit eg {position:0, uvs:1}
 */
export default class Shader
{
    constructor(gl, vertexSrc, fragmentSrc, precision, attributeLocations)
    {
        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        if (precision)
        {
            vertexSrc = setPrecision(vertexSrc, precision);
            fragmentSrc = setPrecision(fragmentSrc, precision);
        }

        /**
         * The shader program
         *
         * @member {WebGLProgram}
         */
        // First compile the program..
        this.program = compileProgram(gl, vertexSrc, fragmentSrc, attributeLocations);

        /**
         * The attributes of the shader as an object containing the following properties
         * {
         *  type,
         *  size,
         *  location,
         *  pointer
         * }
         * @member {Object}
         */
        // next extract the attributes
        this.attributes = extractAttributes(gl, this.program);

        this.uniformData = extractUniforms(gl, this.program);

        /**
         * The uniforms of the shader as an object containing the following properties
         * {
         *  gl,
         *  data
         * }
         * @member {Object}
         */
        this.uniforms = generateUniformAccessObject(gl, this.uniformData);

        this.uniformGroups = {};

        this.id = ID++;
    }

    /**
     * Uses this shader
     */
    bind()
    {
        this.gl.useProgram(this.program);
    }

    /**
     * Destroys this shader
     * TODO
     */
    destroy()
    {
        this.attributes = null;
        this.uniformData = null;
        this.uniforms = null;

        const gl = this.gl;

        gl.deleteProgram(this.program);
    }
}
