import '~/scene/graphics/init';
import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Container, Graphics } from '~/scene';

import type { EventBoundary } from '../EventBoundary';
import type { EventsViewData } from '../EventSystem';
import type { WebGLRenderer } from '~/rendering';

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

function touchEvent(type: string, target: EventTarget, clientX: number, clientY: number)
{
    const touch = new Touch({
        identifier: 1,
        target,
        clientX,
        clientY,
    });

    return new TouchEvent(type, {
        changedTouches: [touch],
        touches: type === 'touchstart' ? [touch] : [],
        bubbles: true,
        cancelable: true,
    });
}

function getView(renderer: WebGLRenderer, element: EventTarget): EventsViewData
{
    return renderer.events['_views'].get(element);
}

function hasActivePress(boundary: EventBoundary, pointerId: number): boolean
{
    const data = boundary['mappingState'].trackingData[pointerId];

    if (!data) return false;

    const press = data.pressTargetsByButton;

    for (const button in press)
    {
        if (press[button]) return true;
    }

    return false;
}

async function setupMultiView()
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

    const canvasB = createCanvas(200, 0);
    const viewB = renderer.addView({ canvas: canvasB });

    const sceneA = createScene();
    const sceneB = createScene();

    renderer.render({ container: sceneA.stage });
    renderer.render({ container: sceneB.stage, target: canvasB });

    return { renderer, canvasA, canvasB, viewB, sceneA, sceneB };
}

// Force touch-only event binding so _toggleViewEvents binds element-scoped touch listeners
// (the !supportsPointerEvents branch), including touchcancel. Mirrors MultiViewTouchScoping.
async function setupTouchMultiView()
{
    const renderer = await getWebGLRenderer({
        width: 100,
        height: 100,
        multiView: true,
    });

    renderer.events.setTargetElement(null);
    (renderer.events as any).supportsPointerEvents = false;
    (renderer.events as any).supportsTouchEvents = true;

    const canvasA = renderer.canvas as HTMLCanvasElement;

    canvasA.style.cssText = 'position: fixed; left: 0px; top: 0px; width: 100px; height: 100px;';
    document.body.appendChild(canvasA);
    attachedCanvases.push(canvasA);

    renderer.events.setTargetElement(canvasA);

    const canvasB = createCanvas(200, 0);
    const viewB = renderer.addView({ canvas: canvasB });

    const sceneA = createScene();
    const sceneB = createScene();

    renderer.render({ container: sceneA.stage });
    renderer.render({ container: sceneB.stage, target: canvasB });

    return { renderer, canvasA, canvasB, viewB, sceneA, sceneB };
}

describe('Multi-view pointer cancel', () =>
{
    it('clears a secondary view\'s press when its gesture is cancelled', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const boundaryB = getView(renderer, canvasB).boundary;

        // start a press on canvas B (local 25,25 hits scene B's geometry)
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        expect(hasActivePress(boundaryB, 1)).toBe(true);

        // the OS cancels the gesture on canvas B
        canvasB.dispatchEvent(pointerEvent('pointercancel', 225, 25));

        // resetTrackingData cleared the phantom press
        expect(hasActivePress(boundaryB, 1)).toBe(false);

        renderer.destroy();
    });

    it('does not spuriously dispatch to a cancelled view on a later gesture on another view', async () =>
    {
        const { renderer, canvasA, canvasB, sceneB } = await setupMultiView();

        const boundaryB = getView(renderer, canvasB).boundary;

        const upOutsideB = jest.fn();

        sceneB.graphics.on('pointerupoutside', upOutsideB);

        // press on canvas B, then cancel it
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));
        canvasB.dispatchEvent(pointerEvent('pointercancel', 225, 25));

        const mapSpyB = jest.spyOn(boundaryB, 'mapEvent');

        // a fresh, independent gesture entirely on canvas A
        canvasA.dispatchEvent(pointerEvent('pointerdown', 25, 25));
        // window-level up over canvas A: with a phantom press on B, B would be wrongly included
        window.dispatchEvent(pointerEvent('pointerup', 25, 25, { bubbles: true }));

        // the cancel cleared B's press, so the A gesture never fans out to B
        expect(upOutsideB).not.toHaveBeenCalled();
        expect(mapSpyB).not.toHaveBeenCalled();

        mapSpyB.mockRestore();
        renderer.destroy();
    });

    it('removes the pointercancel listener on view teardown', async () =>
    {
        const { renderer, canvasB, viewB } = await setupMultiView();

        const boundaryB = getView(renderer, canvasB).boundary;
        const resetSpy = jest.spyOn(boundaryB, 'resetTrackingData');

        renderer.removeView(viewB);

        // the listener was removed with the view; a later cancel on the orphaned canvas is a no-op
        canvasB.dispatchEvent(pointerEvent('pointercancel', 225, 25));

        expect(resetSpy).not.toHaveBeenCalled();

        resetSpy.mockRestore();
        renderer.destroy();
    });

    it('clears a secondary view\'s press on touchcancel', async () =>
    {
        const { renderer, canvasB } = await setupTouchMultiView();

        const boundaryB = getView(renderer, canvasB).boundary;

        // start a touch press on canvas B
        canvasB.dispatchEvent(touchEvent('touchstart', canvasB, 225, 25));

        expect(hasActivePress(boundaryB, 1)).toBe(true);

        // the OS cancels the touch on canvas B
        canvasB.dispatchEvent(touchEvent('touchcancel', canvasB, 225, 25));

        expect(hasActivePress(boundaryB, 1)).toBe(false);

        renderer.destroy();
    });
});
