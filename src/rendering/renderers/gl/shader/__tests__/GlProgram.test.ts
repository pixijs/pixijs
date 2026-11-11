import { GlProgram } from '../GlProgram';
import { GlProgramData } from '../GlProgramData';
import { getGlProgram, getWebGLRenderer } from '@test-utils';

import type { WebGLRenderer } from '../../WebGLRenderer';

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

    it('reflects attributes when another instance reuses the compiled program', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const first = getGlProgram();
        const second = getGlProgram();
        const createProgram = jest.spyOn(renderer.gl, 'createProgram');

        try
        {
            renderer.shader._getProgramData(first);
            renderer.shader._getProgramData(second);

            expect(createProgram).toHaveBeenCalledTimes(1);
            expect(second._attributeData.aPosition.location).toBe(first._attributeData.aPosition.location);
            expect(second._uniformData).toEqual(first._uniformData);
            expect(second._uniformBlockData).toEqual(first._uniformBlockData);
        }
        finally
        {
            renderer.destroy();
        }
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
