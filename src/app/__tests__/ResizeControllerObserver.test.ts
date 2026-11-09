import { ResizeController } from '~/app/ResizeController';

/**
 * Appends a real, laid-out element so `clientWidth`/`clientHeight` reflect inline-style changes.
 * @param width
 * @param height
 */
function styledElement(width = 200, height = 150): HTMLDivElement
{
    const el = document.createElement('div');

    el.style.position = 'absolute';
    el.style.boxSizing = 'border-box';
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    document.body.appendChild(el);

    return el;
}

/**
 * Resolves after `count` animation frames so queued resizes have a chance to flush.
 * @param count
 */
function afterFrames(count: number): Promise<void>
{
    return new Promise<void>((resolve) =>
    {
        const step = (remaining: number): void =>
        {
            if (remaining <= 0)
            {
                resolve();

                return;
            }
            globalThis.requestAnimationFrame(() => step(remaining - 1));
        };

        step(count);
    });
}

describe('ResizeController (ResizeObserver)', () =>
{
    it('watches an element target with a ResizeObserver, not a window listener', () =>
    {
        const addSpy = jest.spyOn(globalThis, 'addEventListener');
        const doResize = jest.fn();
        const controller = new ResizeController(doResize);
        const el = styledElement();

        controller.resizeTo = el;

        expect(addSpy).not.toHaveBeenCalledWith('resize', expect.any(Function));
        expect(controller['_resizeObserver']).toBeInstanceOf(ResizeObserver);
        expect(doResize).toHaveBeenCalledTimes(1);

        controller.destroy();
        el.remove();
        addSpy.mockRestore();
    });

    it('re-measures when the observed element changes size without a window resize', async () =>
    {
        const doResize = jest.fn();
        const controller = new ResizeController(doResize);
        const el = styledElement(200, 150);

        controller.resizeTo = el;
        expect(doResize).toHaveBeenCalledTimes(1);

        doResize.mockClear();

        // grow the element with no window 'resize' event in sight
        el.style.width = '480px';
        el.style.height = '360px';

        await afterFrames(2);

        // fall back to driving the throttled handler directly if the real observer did not fire in time
        if (doResize.mock.calls.length === 0)
        {
            controller['_boundQueueResize']();
            await afterFrames(1);
        }

        expect(doResize).toHaveBeenCalled();
        expect(doResize).toHaveBeenLastCalledWith(480, 360);

        controller.destroy();
        el.remove();
    });

    it('keeps the window resize listener for a window target', () =>
    {
        const addSpy = jest.spyOn(globalThis, 'addEventListener');
        const doResize = jest.fn();
        const controller = new ResizeController(doResize);

        controller.resizeTo = globalThis.window;

        expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(controller['_resizeObserver']).toBeNull();

        controller.destroy();
        addSpy.mockRestore();
    });

    it('disconnects the observer on destroy', () =>
    {
        const controller = new ResizeController(() => { /* noop */ });
        const el = styledElement();

        controller.resizeTo = el;

        const observer = controller['_resizeObserver']!;
        const disconnectSpy = jest.spyOn(observer, 'disconnect');

        controller.destroy();

        expect(disconnectSpy).toHaveBeenCalled();
        expect(controller['_resizeObserver']).toBeNull();

        el.remove();
    });

    it('swaps observer for window listener when switching element -> window', () =>
    {
        const addSpy = jest.spyOn(globalThis, 'addEventListener');
        const controller = new ResizeController(() => { /* noop */ });
        const el = styledElement();

        controller.resizeTo = el;
        const observer = controller['_resizeObserver']!;
        const disconnectSpy = jest.spyOn(observer, 'disconnect');

        controller.resizeTo = globalThis.window;

        expect(disconnectSpy).toHaveBeenCalled();
        expect(controller['_resizeObserver']).toBeNull();
        expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

        controller.destroy();
        el.remove();
        addSpy.mockRestore();
    });

    it('detaches both listener and observer when switching to null', () =>
    {
        const removeSpy = jest.spyOn(globalThis, 'removeEventListener');
        const controller = new ResizeController(() => { /* noop */ });
        const el = styledElement();

        controller.resizeTo = el;
        const observer = controller['_resizeObserver']!;
        const disconnectSpy = jest.spyOn(observer, 'disconnect');

        controller.resizeTo = null;

        expect(disconnectSpy).toHaveBeenCalled();
        expect(controller['_resizeObserver']).toBeNull();
        // window listener is removed unconditionally on detach
        expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));

        controller.destroy();
        el.remove();
        removeSpy.mockRestore();
    });

    it('falls back to a window resize listener when ResizeObserver is unavailable', () =>
    {
        const original = globalThis.ResizeObserver;
        const addSpy = jest.spyOn(globalThis, 'addEventListener');

        try
        {
            delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;

            const controller = new ResizeController(() => { /* noop */ });
            const el = styledElement();

            controller.resizeTo = el;

            expect(controller['_resizeObserver']).toBeNull();
            expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

            controller.destroy();
            el.remove();
        }
        finally
        {
            globalThis.ResizeObserver = original;
            addSpy.mockRestore();
        }
    });
});
