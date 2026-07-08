import { ResizeController } from '../ResizeController';

function attachedElement(width = 200, height = 150): HTMLDivElement
{
    const el = document.createElement('div');

    Object.defineProperty(el, 'clientWidth', { configurable: true, value: width });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: height });
    document.body.appendChild(el);

    return el;
}

describe('ResizeController', () =>
{
    it('cancels a pending resize even when requestAnimationFrame returns handle 0', () =>
    {
        const rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(0);
        const cancelSpy = jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => { /* noop */ });

        const controller = new ResizeController(() => { /* noop */ });
        const el = attachedElement();

        // resizeTo fires an immediate resize; queue a frame whose handle is 0
        controller.resizeTo = el;
        controller.queueResize();

        controller.cancelResize();

        // the falsy-0 guard would have skipped this; the !== null guard must call it
        expect(cancelSpy).toHaveBeenCalledWith(0);
        expect(controller['_resizeId']).toBeNull();

        controller.destroy();
        el.remove();
        rafSpy.mockRestore();
        cancelSpy.mockRestore();
    });

    it('runs doResize once per animation-frame flush', async () =>
    {
        const doResize = jest.fn();
        const controller = new ResizeController(doResize);
        const el = attachedElement(320, 240);

        // setting the target performs one immediate resize
        controller.resizeTo = el;
        expect(doResize).toHaveBeenCalledTimes(1);

        doResize.mockClear();

        // multiple queues within the same frame coalesce to a single flush
        controller.queueResize();
        controller.queueResize();
        controller.queueResize();

        await new Promise<void>((resolve) => globalThis.requestAnimationFrame(() => resolve()));

        expect(doResize).toHaveBeenCalledTimes(1);
        expect(doResize).toHaveBeenLastCalledWith(320, 240);

        controller.destroy();
        el.remove();
    });

    it('resizes immediately and observes an element target instead of the window', () =>
    {
        const addSpy = jest.spyOn(globalThis, 'addEventListener');
        const doResize = jest.fn();
        const controller = new ResizeController(doResize);
        const el = attachedElement(100, 80);

        controller.resizeTo = el;

        expect(controller.resizeTo).toBe(el);
        expect(doResize).toHaveBeenCalledTimes(1);
        expect(doResize).toHaveBeenCalledWith(100, 80);
        // an element target is watched with a ResizeObserver, not a window 'resize' listener
        expect(controller['_resizeObserver']).toBeInstanceOf(ResizeObserver);
        expect(addSpy).not.toHaveBeenCalledWith('resize', expect.any(Function));

        controller.destroy();
        el.remove();
        addSpy.mockRestore();
    });

    it('disconnects the element observer and stops resizing when set to null', () =>
    {
        const doResize = jest.fn();
        const controller = new ResizeController(doResize);
        const el = attachedElement();

        controller.resizeTo = el;

        const disconnectSpy = jest.spyOn(controller['_resizeObserver']!, 'disconnect');

        doResize.mockClear();

        controller.resizeTo = null;

        expect(controller.resizeTo).toBeNull();
        expect(disconnectSpy).toHaveBeenCalled();
        expect(controller['_resizeObserver']).toBeNull();

        // with no target, queue/resize become no-ops
        controller.queueResize();
        controller.resizeNow();
        expect(doResize).not.toHaveBeenCalled();

        controller.destroy();
        el.remove();
    });

    it('cancels a queued resize on destroy', () =>
    {
        const cancelSpy = jest.spyOn(globalThis, 'cancelAnimationFrame');
        const doResize = jest.fn();
        const controller = new ResizeController(doResize);
        const el = attachedElement();

        controller.resizeTo = el;
        controller.queueResize();

        expect(controller['_resizeId']).not.toBeNull();

        controller.destroy();

        expect(cancelSpy).toHaveBeenCalled();
        expect(controller['_resizeId']).toBeNull();
        expect(controller.resizeTo).toBeNull();

        el.remove();
        cancelSpy.mockRestore();
    });
});
