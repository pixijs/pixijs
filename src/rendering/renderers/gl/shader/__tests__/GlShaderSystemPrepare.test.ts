import { GlProgram } from '../GlProgram';
import { getWebGLRenderer } from '@test-utils';

function program(n: number): GlProgram
{
    return new GlProgram({
        vertex: `
            in vec2 aPosition;
            void main(void) { gl_Position = vec4(aPosition * ${n}.0, 0.0, 1.0); }
        `,
        fragment: `
            out vec4 finalColor;
            void main(void) { finalColor = vec4(${n}.0 / 8.0); }
        `,
    });
}

describe('GlShaderSystem.prepare and settle', () =>
{
    it('should link a prepared program once and use that link on first draw', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;
        const createProgram = jest.spyOn(gl, 'createProgram');
        const p = program(1);

        renderer.shader.prepare([p]);
        expect(createProgram).toHaveBeenCalledTimes(1);

        const data = renderer.shader._getProgramData(p);

        expect(createProgram).toHaveBeenCalledTimes(1);
        expect(gl.getProgramParameter(data.program, gl.LINK_STATUS)).toBe(true);
        expect(p._attributeData.aPosition).toBeDefined();

        createProgram.mockRestore();
        renderer.destroy();
    });

    it('should finish only linked programs and report how many are left', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;
        const programs = [program(2), program(3), program(4)];

        renderer.shader.prepare(programs);

        let left = programs.length;

        for (let i = 0; i < 1000 && left > 0; i++)
        {
            left = renderer.shader.settle(1000);
            if (left) await new Promise((resolve) => setTimeout(resolve, 5));
        }
        expect(left).toBe(0);

        const createProgram = jest.spyOn(gl, 'createProgram');

        for (const p of programs) renderer.shader._getProgramData(p);
        expect(createProgram).not.toHaveBeenCalled();

        createProgram.mockRestore();
        renderer.destroy();
    });

    it('should not start a program twice', async () =>
    {
        const renderer = await getWebGLRenderer();
        const createProgram = jest.spyOn(renderer.gl, 'createProgram');
        const p = program(5);

        renderer.shader._getProgramData(p);
        renderer.shader.prepare([p, p]);
        expect(createProgram).toHaveBeenCalledTimes(1);

        createProgram.mockRestore();
        renderer.destroy();
    });
});
