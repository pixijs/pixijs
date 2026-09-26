import { GlProgram } from '../GlProgram';
import { GlProgramData } from '../GlProgramData';

describe('GlProgram', () =>
{
    const vertex = 'void main() { gl_Position = vec4(0.0); }';
    const fragment = 'void main() { gl_FragColor = vec4(1.0); }';

    it('uses the original shader sources for its key', () =>
    {
        const first = new GlProgram({ vertex, fragment });
        const second = new GlProgram({ vertex, fragment });

        expect(first._key).toBe(second._key);
    });

    it('generates different keys for different shader sources', () =>
    {
        const first = new GlProgram({ vertex, fragment });
        const second = new GlProgram({ vertex, fragment: `${fragment} ` });

        expect(first._key).not.toBe(second._key);
    });
});

describe('GlProgramData', () =>
{
    it('deletes its WebGL program when destroyed', () =>
    {
        const program = {} as WebGLProgram;
        const deleteProgram = jest.fn();
        const gl = { deleteProgram } as unknown as WebGL2RenderingContext;
        const programData = new GlProgramData(program, {}, gl);

        programData.destroy();

        expect(deleteProgram).toHaveBeenCalledWith(program);
        expect(programData.program).toBeNull();
    });
});
