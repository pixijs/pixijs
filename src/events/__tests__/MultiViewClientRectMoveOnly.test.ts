import '~/scene/graphics/init';
import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Container, Graphics } from '~/scene';

function createScene()
{
    const stage = new Container();
    const graphics = stage.addChild(
        new Graphics()
            .rect(0, 0, 50, 50)
            .fill(0xFFFFFF)
    );

    graphics.eventMode = 'static';

    return { stage, graphics };
}

const attachedCanvases: HTMLCanvasElement[] = [];

function createCanvas(left = 0, top = 0, width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = `position: fixed; left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;`;
    document.body.appendChild(canvas);
    attachedCanvases.push(canvas);

    return canvas;
}

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

describe('Multi-view EventSystem clientRect re-measure on move-only views', () =>
{
    it('re-measures a move-only (click:false) view\'s rect on pointerover when the canvas moved'
        + ' with no scroll/resize', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 100,
            height: 100,
            multiView: true,
        });

        const canvasA = renderer.canvas as HTMLCanvasElement;

        canvasA.style.cssText = 'position: fixed; left: 0px; top: 0px; width: 100px; height: 100px;';
        document.body.appendChild(canvasA);
        attachedCanvases.push(canvasA);

        // view B at page (200, 0), move-only: the move feature is on but click is off. This is the
        // case the fix targets: the pointerover rect re-measure must run before the click gate, so a
        // click-disabled view still refreshes its cached rect on enter.
        const canvasB = createCanvas(200, 0);

        renderer.addView({ canvas: canvasB, eventFeatures: { move: true, click: false } });

        const sceneB = createScene();

        renderer.render({ container: sceneB.stage, target: canvasB });

        const moveB = jest.fn();

        sceneB.graphics.on('pointermove', moveB);

        // prime B's clientRect against its position at left 200: enter the canvas, then move inside it.
        // client (225, 25) on a canvas at left 200 -> local (25, 25), a hit on the 50x50 graphics.
        canvasB.dispatchEvent(pointerEvent('pointerover', 225, 25));
        document.dispatchEvent(pointerEvent('pointermove', 225, 25));

        expect(moveB).toHaveBeenCalledTimes(1);
        expect(moveB.mock.calls[0][0].global.x).toBe(25);
        expect(moveB.mock.calls[0][0].global.y).toBe(25);

        // move the canvas WITHOUT dispatching scroll/resize/sourceResize. The cached rect is now stale;
        // only a pointer entering the canvas (over phase of _onPointerOverOut) can refresh it for a
        // move-only view, and only if that re-measure runs before the click-feature gate.
        canvasB.style.left = '300px';

        // a fresh enter at the new position, then a move at the shifted client coordinate.
        // client (325, 25) on a canvas now at left 300 -> local (25, 25) only if the rect was refreshed.
        canvasB.dispatchEvent(pointerEvent('pointerover', 325, 25));
        document.dispatchEvent(pointerEvent('pointermove', 325, 25));

        expect(moveB).toHaveBeenCalledTimes(2);
        // before the fix, the click-gated over handler skips the invalidation for a click:false view,
        // so the stale rect (left 200) maps client 325 -> local 125, missing the 50x50 graphics, and
        // the move never reaches the graphics (call count stays at 1). With the fix the rect is
        // re-measured to left 300, mapping client 325 -> local 25, a hit.
        expect(moveB.mock.calls[1][0].global.x).toBe(25);
        expect(moveB.mock.calls[1][0].global.y).toBe(25);

        renderer.destroy();
    });
});
