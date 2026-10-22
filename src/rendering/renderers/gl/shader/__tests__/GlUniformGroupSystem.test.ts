import '~/rendering/init';
import { describeLocalOnly, getWebGLRenderer } from '@test-utils';
import { Graphics } from '~/scene';

describeLocalOnly('GlUniformGroupSystem', () =>
{
    it('should upload uniforms for a program recompiled after the context was lost while compiling', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 64, height: 64 });
        const gl = renderer.gl;
        const linkProgram = gl.linkProgram.bind(gl);

        const { promise: restored, resolve } = Promise.withResolvers<void>();

        renderer.canvas.addEventListener('webglcontextrestored', () => resolve(), { once: true });

        // The context dies between linkProgram() and the metadata queries, which is the window
        // Chromium leaves open before webglcontextlost arrives. The program links against a dead
        // context and reflects no uniform metadata at all.
        let armed = true;

        gl.linkProgram = ((program: WebGLProgram) =>
        {
            linkProgram(program);

            if (armed)
            {
                armed = false;
                renderer.context.forceContextLoss();
            }
        }) as typeof gl.linkProgram;

        const graphics = new Graphics().rect(0, 0, 64, 64).fill(0x00ff00);

        renderer.render(graphics);
        await restored;
        gl.linkProgram = linkProgram;
        renderer.render(graphics);

        const { pixels } = renderer.extract.pixels(graphics);

        expect(pixels.some((value) => value > 0)).toBe(true);

        graphics.destroy();
        renderer.destroy();
    });
});
