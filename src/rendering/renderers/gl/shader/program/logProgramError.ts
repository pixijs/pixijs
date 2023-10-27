/**
 * will log a shader error highlighting the lines with the error
 * also will add numbers along the side.
 * @param gl - the WebGLContext
 * @param shader - the shader to log errors for
 */
function logPrettyShaderError(gl: WebGLRenderingContext, shader: WebGLShader): void
{
    const shaderSrc = gl.getShaderSource(shader)
        .split('\n')
        .map((line, index) => `${index}: ${line}`);

    const shaderLog = gl.getShaderInfoLog(shader);
    const splitShader = shaderLog.split('\n');

    const dedupe: Record<number, boolean> = {};

    const lineNumbers = splitShader.map((line) => parseFloat(line.replace(/^ERROR\: 0\:([\d]+)\:.*$/, '$1')))
        .filter((n) =>
        {
            if (n && !dedupe[n])
            {
                dedupe[n] = true;

                return true;
            }

            return false;
        });

    const logArgs = [''];

    lineNumbers.forEach((number) =>
    {
        shaderSrc[number - 1] = `%c${shaderSrc[number - 1]}%c`;
        logArgs.push('background: #FF0000; color:#FFFFFF; font-size: 10px', 'font-size: 10px');
    });

    const fragmentSourceToLog = shaderSrc
        .join('\n');

    logArgs[0] = fragmentSourceToLog;

    console.error(shaderLog);

    // eslint-disable-next-line no-console
    console.groupCollapsed('click to view full shader code');
    console.warn(...logArgs);
    // eslint-disable-next-line no-console
    console.groupEnd();
}

/**
 *
 * logs out any program errors
 * @param gl - The current WebGL context
 * @param program - the WebGL program to display errors for
 * @param vertexShader  - the fragment WebGL shader program
 * @param fragmentShader - the vertex WebGL shader program
 * @private
 */
export function logProgramError(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
): void
{
    // if linking fails, then log and cleanup
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
        {
            logPrettyShaderError(gl, vertexShader);
        }

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
        {
            logPrettyShaderError(gl, fragmentShader);
        }

        console.error('PixiJS Error: Could not initialize shader.');

        // if there is a program info log, log it
        if (gl.getProgramInfoLog(program) !== '')
        {
            console.warn('PixiJS Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
        }
    }
}
