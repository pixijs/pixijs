import '~/scene/graphics/init';
import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Container, Graphics } from '~/scene';

function createScene(x = 0, y = 0)
{
    const stage = new Container();
    const graphics = stage.addChild(
        new Graphics()
            .rect(0, 0, 50, 50)
            .fill(0xFFFFFF)
    );

    graphics.position.set(x, y);
    graphics.eventMode = 'static';

    return { stage, graphics };
}

const attachedCanvases: HTMLCanvasElement[] = [];

afterEach(() =>
{
    attachedCanvases.forEach((canvas) => canvas.remove());
    attachedCanvases.length = 0;
});

function pointerEvent(type: string, clientX: number, clientY: number, extra: PointerEventInit = {})
{
    return new PointerEvent(type, {
        clientX,
        clientY,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        bubbles: true,
        ...extra,
    });
}

async function setup()
{
    const renderer = await getWebGLRenderer({
        width: 100,
        height: 100,
        multiView: true,
    });

    const canvas = renderer.canvas as HTMLCanvasElement;

    // a fixed canvas at a known left/top so client->local mapping is deterministic
    canvas.style.cssText = 'position: fixed; left: 0px; top: 0px; width: 100px; height: 100px;';
    document.body.appendChild(canvas);
    attachedCanvases.push(canvas);

    const scene = createScene();

    renderer.render({ container: scene.stage });

    return { renderer, canvas, scene };
}

describe('Multi-view client rect invalidation', () =>
{
    it('stale after CSS move is corrected by pointer-enter', async () =>
    {
        const { renderer, canvas, scene } = await setup();

        const over = jest.fn();
        const move = jest.fn();

        scene.graphics.on('pointerover', over);
        scene.graphics.on('pointermove', move);

        // prime the cache against the canvas at left 0: over + move at client (25, 25) -> local (25, 25)
        canvas.dispatchEvent(pointerEvent('pointerover', 25, 25));
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        expect(move).toHaveBeenCalledTimes(1);
        expect(move.mock.calls[0][0].global.x).toBe(25);

        // move the canvas via CSS with NO scroll/resize event - the cache is now stale
        canvas.style.left = '40px';

        // a pointer enters at the shifted client coords: over invalidates, the following move
        // re-measures against the live position. client (65, 25) on a canvas at left 40 -> local (25, 25)
        canvas.dispatchEvent(pointerEvent('pointerover', 65, 25));
        document.dispatchEvent(pointerEvent('pointermove', 65, 25));

        expect(move).toHaveBeenCalledTimes(2);
        expect(move.mock.calls[1][0].global.x).toBe(25);
        expect(move.mock.calls[1][0].global.y).toBe(25);

        renderer.destroy();
    });

    it('pointerdown re-measures', async () =>
    {
        const { renderer, canvas, scene } = await setup();

        const move = jest.fn();
        const down = jest.fn();

        scene.graphics.on('pointermove', move);
        scene.graphics.on('pointerdown', down);

        // prime the cache against the canvas at left 0
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        expect(move).toHaveBeenCalledTimes(1);

        // move the canvas via CSS with NO scroll/resize event
        canvas.style.left = '40px';

        // a gesture down re-measures: client (65, 25) on a canvas at left 40 -> local (25, 25)
        canvas.dispatchEvent(pointerEvent('pointerdown', 65, 25));

        expect(down).toHaveBeenCalledTimes(1);
        expect(down.mock.calls[0][0].global.x).toBe(25);
        expect(down.mock.calls[0][0].global.y).toBe(25);

        renderer.destroy();
    });

    it('hot path preserved', async () =>
    {
        const { renderer, canvas } = await setup();

        const spy = jest.spyOn(canvas, 'getBoundingClientRect');

        // one pointer-enter (the only allowed re-measure), then a burst of moves with no
        // intervening over/down: all of them map from the single cached rect
        canvas.dispatchEvent(pointerEvent('pointerover', 25, 25));

        for (let i = 0; i < 8; i++)
        {
            document.dispatchEvent(pointerEvent('pointermove', 25 + i, 25 + i));
        }

        expect(spy.mock.calls.length).toBeLessThanOrEqual(1);

        spy.mockRestore();

        renderer.destroy();
    });

    it('out phase does not invalidate', async () =>
    {
        const { renderer, canvas } = await setup();

        // over primes the cache (one measure); out must NOT invalidate, so the following move
        // is still served from cache (no extra measure). The view binds pointerleave for the
        // out phase, which is routed through the same over/out handler.
        canvas.dispatchEvent(pointerEvent('pointerover', 25, 25));

        const spy = jest.spyOn(canvas, 'getBoundingClientRect');

        canvas.dispatchEvent(pointerEvent('pointerleave', 25, 25));
        document.dispatchEvent(pointerEvent('pointermove', 30, 30));

        expect(spy).not.toHaveBeenCalled();

        spy.mockRestore();

        renderer.destroy();
    });
});
