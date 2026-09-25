import { generateProgram } from '../generateProgram';
import { getTestContext } from '../getTestContext';
import { GlProgram } from '~/rendering';

describe('generateProgram', () =>
{
    // Some Adreno 3xx / ANGLE WebGL1 drivers serve program binaries whose bound attribute
    // locations are wrong (Chromium gpu_driver_bug_list id 126, crbug.com/510637), so a program
    // built with bindAttribLocation + relink can draw nothing. We must only ever read the
    // locations the driver assigned. (pixijs/pixijs#12086)
    it('should keep driver-assigned attribute locations on WebGL1 instead of binding sorted ones', () =>
    {
        const gl = getTestContext();

        expect(gl.getParameter(gl.VERSION)).toMatch(/^WebGL 1/);

        const bindAttribLocation = jest.spyOn(gl, 'bindAttribLocation');
        const linkProgram = jest.spyOn(gl, 'linkProgram');

        // declared in reverse alphabetical order: sorting by name would give a=0, b=1,
        // while ANGLE assigns unbound attributes in declaration order (b=0, a=1)
        const program = new GlProgram({
            vertex: `
                attribute vec4 b;
                attribute vec4 a;

                void main() {
                    gl_Position = a + b;
                }
            `,
            fragment: `
                void main() {
                    gl_FragColor = vec4(1.0);
                }
            `,
        });

        const glProgram = generateProgram(gl, program);

        expect(bindAttribLocation).not.toHaveBeenCalled();
        expect(linkProgram).toHaveBeenCalledTimes(1);

        expect(program._attributeData.b.location).toBe(0);
        expect(program._attributeData.a.location).toBe(1);
        expect(program._attributeData.a.location).toBe(gl.getAttribLocation(glProgram.program, 'a'));
        expect(program._attributeData.b.location).toBe(gl.getAttribLocation(glProgram.program, 'b'));

        bindAttribLocation.mockRestore();
        linkProgram.mockRestore();
    });
});
