import { Application } from '~/app';

function attachedDiv(width = 256, height = 256): HTMLDivElement
{
    const div = document.createElement('div');

    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    document.body.appendChild(div);

    return div;
}

describe('ResizePlugin cancelResize', () =>
{
    let app: Application | null;
    let div: HTMLDivElement;

    beforeEach(() =>
    {
        div = attachedDiv();
    });

    afterEach(() =>
    {
        app?.destroy();
        div.remove();
    });

    it('exposes cancelResize on the application instance', async () =>
    {
        app = new Application();
        await app.init({ resizeTo: div });

        expect(typeof app.cancelResize).toBe('function');
        expect(() => app.cancelResize()).not.toThrow();
    });

    it('cancelResize cancels a queued resize', async () =>
    {
        app = new Application();
        await app.init({ resizeTo: div });

        const cancelSpy = jest.spyOn(globalThis, 'cancelAnimationFrame');

        app.queueResize();
        app.cancelResize();

        expect(cancelSpy).toHaveBeenCalled();

        cancelSpy.mockRestore();
    });

    it('cancelResize is removed after destroy', async () =>
    {
        app = new Application();
        await app.init({ resizeTo: div });

        const destroyed = app;

        app = null;
        destroyed.destroy();

        expect(destroyed.cancelResize).toBeNull();
    });
});
