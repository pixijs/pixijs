import { GlContextSystem, WebGLRenderer } from '~/rendering';

describe('GlContextSystem destroy', () =>
{
    it('destroy does not throw when the context was never created', () =>
    {
        const renderer = new WebGLRenderer();

        // construct the system directly so its GL context is never created (this.gl is undefined)
        const context = new GlContextSystem(renderer);

        expect(() => context.destroy()).not.toThrow();
    });

    it('destroy on an initialized renderer still removes listeners', async () =>
    {
        const renderer = new WebGLRenderer();

        await renderer.init({ width: 100, height: 100 });

        expect(() => renderer.destroy()).not.toThrow();
    });
});
