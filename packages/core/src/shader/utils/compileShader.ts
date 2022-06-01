/**
 * @private
 * @param {WebGLRenderingContext} gl - The current WebGL context {WebGLProgram}
 * @param {number} type - the type, can be either VERTEX_SHADER or FRAGMENT_SHADER
 * @param {string} src - The vertex shader source as an array of strings.
 * @returns {WebGLShader} the shader
 */
export function compileShader(gl: WebGLRenderingContextBase, type: number, src: string): WebGLShader
{
    const shader = gl.createShader(type);

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    return shader;
}
