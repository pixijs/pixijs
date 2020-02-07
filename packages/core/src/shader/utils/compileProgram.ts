/**
 * @private
 * @param gl {WebGLRenderingContext} The current WebGL context {WebGLProgram}
 * @param type {Number} the type, can be either VERTEX_SHADER or FRAGMENT_SHADER
 * @param src {string} The vertex shader source as an array of strings.
 * @return {WebGLShader} the shader
 */
function compileShader(gl: WebGLRenderingContextBase, type: number, src: string): WebGLShader
{
    const shader = gl.createShader(type);

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    return shader;
}

/**
 * @method compileProgram
 * @private
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL context {WebGLProgram}
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 * @param attributeLocations {Object} An attribute location map that lets you manually set the attribute locations
 * @return {WebGLProgram} the shader program
 */
export function compileProgram(gl: WebGLRenderingContextBase, vertexSrc: string, fragmentSrc: string,
    attributeLocations?: {[key: string]: number}): WebGLProgram
{
    const glVertShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const glFragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

    let program = gl.createProgram();

    gl.attachShader(program, glVertShader);
    gl.attachShader(program, glFragShader);

    // optionally, set the attributes manually for the program rather than letting WebGL decide..
    if (attributeLocations)
    {
        for (const i in attributeLocations)
        {
            gl.bindAttribLocation(program, attributeLocations[i], i);
        }
    }

    gl.linkProgram(program);

    // if linking fails, then log and cleanup
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        if (!gl.getShaderParameter(glVertShader, gl.COMPILE_STATUS))
        {
            console.warn(vertexSrc);
            console.error(gl.getShaderInfoLog(glVertShader));
        }

        if (!gl.getShaderParameter(glFragShader, gl.COMPILE_STATUS))
        {
            console.warn(fragmentSrc);
            console.error(gl.getShaderInfoLog(glFragShader));
        }

        console.error('Pixi.js Error: Could not initialize shader.');
        console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS));
        console.error('gl.getError()', gl.getError());

        // if there is a program info log, log it
        if (gl.getProgramInfoLog(program) !== '')
        {
            console.warn('Pixi.js Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
        }

        gl.deleteProgram(program);
        program = null;
    }

    // clean up some shaders
    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    return program;
}
