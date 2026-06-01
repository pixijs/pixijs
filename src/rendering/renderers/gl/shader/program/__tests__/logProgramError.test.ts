import { compileShader } from '../compileShader';
import { logProgramError } from '../logProgramError';
import { DOMAdapter } from '~/environment';

describe('logProgramError', () =>
{
    it('should not throw when WebGL context is lost and shader sources are unavailable', () =>
    {
        const canvas = DOMAdapter.get().createCanvas();
        const gl = canvas.getContext('webgl') as WebGLRenderingContext;

        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, `
            attribute vec4 aPosition;
            void main() { gl_Position = aPosition; }
        `);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, `
            precision mediump float;
            void main() { gl_FragColor = vec4(1.0); }
        `);
        const program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        gl.getExtension('WEBGL_lose_context')?.loseContext();

        // After context loss getShaderSource and getShaderInfoLog return null;
        // logProgramError must tolerate this rather than throwing TypeError on null.split
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* silence */ });
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => { /* silence */ });
        const groupCollapsed = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => { /* silence */ });
        const groupEnd = jest.spyOn(console, 'groupEnd').mockImplementation(() => { /* silence */ });

        try
        {
            expect(() => logProgramError(gl, program, vertexShader, fragmentShader)).not.toThrow();
        }
        finally
        {
            consoleError.mockRestore();
            consoleWarn.mockRestore();
            groupCollapsed.mockRestore();
            groupEnd.mockRestore();
        }
    });
});
