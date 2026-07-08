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
        touches: [touch],
        bubbles: true,
        cancelable: true,
    });
}

function getView(renderer: WebGLRenderer, element: EventTarget): EventsViewData
{
    return renderer.events['_views'].get(element);
}

// Force touch-only event binding before any view registers, so _toggleViewEvents binds
// element-scoped touchmove/touchend (the !supportsPointerEvents branch). The main view was
// already registered with pointer listeners during init, so it is torn down and re-registered
// after the flags flip; the secondary view is added afterwards and binds touch listeners directly.
async function setupTouchMultiView()
{
    const renderer = await getWebGLRenderer({
        width: 100,
        height: 100,
        multiView: true,
    });

    // tear down the main view's pointer listeners, flip support flags, then re-bind as touch
    renderer.events.setTargetElement(null);
    (renderer.events as any).supportsPointerEvents = false;
    (renderer.events as any).supportsTouchEvents = true;

    const canvasA = renderer.canvas as HTMLCanvasElement;

    canvasA.style.cssText = 'position: fixed; left: 0px; top: 0px; width: 100px; height: 100px;';
    document.body.appendChild(canvasA);
    attachedCanvases.push(canvasA);

    // re-register the main view; touch listeners now bind because the flags were flipped
    renderer.events.setTargetElement(canvasA);

    const canvasB = createCanvas(200, 0);
    const viewB = renderer.addView({ canvas: canvasB });

    const sceneA = createScene();
    const sceneB = createScene();

    renderer.render({ container: sceneA.stage });
    renderer.render({ container: sceneB.stage, target: canvasB });

    return { renderer, canvasA, canvasB, viewB, sceneA, sceneB };
}

function spyBoundary(boundary: EventBoundary)
{
    return {
        mapEvent: jest.spyOn(boundary, 'mapEvent'),
        dispatchEvent: jest.spyOn(boundary, 'dispatchEvent'),
    };
}

describe('Multi-view touch scoping', () =>
{
    it('binds element-scoped touch listeners on each view', async () =>
    {
        const { renderer, canvasA, canvasB } = await setupTouchMultiView();

        // sanity: both views exist and use distinct boundaries; the touch flags are forced
        expect(getView(renderer, canvasA)).toBeDefined();
        expect(getView(renderer, canvasB)).toBeDefined();
        expect(renderer.events['supportsTouchEvents']).toBe(true);
        expect(renderer.events['supportsPointerEvents']).toBe(false);

        renderer.destroy();
    });

    it('does not leak a secondary-canvas touchmove into the main view', async () =>
    {
        const { renderer, canvasA, canvasB } = await setupTouchMultiView();

        const mainBoundary = getView(renderer, canvasA).boundary;
        const mainSpy = spyBoundary(mainBoundary);

        // canvas B sits at page (200, 0); a touchmove over it dispatched on canvasB sets
        // currentTarget === canvasB during the capture-phase scoped listener.
        canvasB.dispatchEvent(touchEvent('touchmove', canvasB, 225, 25));

        // the touch is scoped to canvas B, so the main view's boundary must never see it.
        // Before the fix the document-level fan-out delivered it to every view, including main.
        expect(mainSpy.mapEvent).not.toHaveBeenCalled();
        expect(mainSpy.dispatchEvent).not.toHaveBeenCalled();

        mainSpy.mapEvent.mockRestore();
        mainSpy.dispatchEvent.mockRestore();
        renderer.destroy();
    });

    it('does not leak a secondary-canvas touchend into the main view', async () =>
    {
        const { renderer, canvasA, canvasB } = await setupTouchMultiView();

        const mainBoundary = getView(renderer, canvasA).boundary;
        const mainSpy = spyBoundary(mainBoundary);

        canvasB.dispatchEvent(touchEvent('touchend', canvasB, 225, 25));

        expect(mainSpy.mapEvent).not.toHaveBeenCalled();
        expect(mainSpy.dispatchEvent).not.toHaveBeenCalled();

        mainSpy.mapEvent.mockRestore();
        mainSpy.dispatchEvent.mockRestore();
        renderer.destroy();
    });

    it('still delivers a main-canvas touchmove to the main boundary (control)', async () =>
    {
        const { renderer, canvasA } = await setupTouchMultiView();

        const mainBoundary = getView(renderer, canvasA).boundary;
        const mainSpy = spyBoundary(mainBoundary);

        // a touch on the MAIN canvas at its local (25, 25) must reach the main boundary
        canvasA.dispatchEvent(touchEvent('touchmove', canvasA, 25, 25));

        expect(mainSpy.mapEvent).toHaveBeenCalled();

        mainSpy.mapEvent.mockRestore();
        mainSpy.dispatchEvent.mockRestore();
        renderer.destroy();
    });

    it('routes a secondary-canvas touchmove to its own boundary only', async () =>
    {
        const { renderer, canvasA, canvasB } = await setupTouchMultiView();

        const mainBoundary = getView(renderer, canvasA).boundary;
        const viewBBoundary = getView(renderer, canvasB).boundary;

        const mainSpy = spyBoundary(mainBoundary);
        const viewBSpy = spyBoundary(viewBBoundary);

        canvasB.dispatchEvent(touchEvent('touchmove', canvasB, 225, 25));

        // the secondary touch reaches view B, and only view B
        expect(viewBSpy.mapEvent).toHaveBeenCalled();
        expect(mainSpy.mapEvent).not.toHaveBeenCalled();

        mainSpy.mapEvent.mockRestore();
        mainSpy.dispatchEvent.mockRestore();
        viewBSpy.mapEvent.mockRestore();
        viewBSpy.dispatchEvent.mockRestore();
        renderer.destroy();
    });

    it('does not fire main-scene pointer handlers for a secondary-canvas touch', async () =>
    {
        const { renderer, canvasB, sceneA, sceneB } = await setupTouchMultiView();

        const moveA = jest.fn();
        const moveB = jest.fn();

        sceneA.graphics.on('pointermove', moveA);
        sceneB.graphics.on('pointermove', moveB);

        // canvas B at page (200, 0): client (225, 25) is local (25, 25), a hit on scene B's geometry
        canvasB.dispatchEvent(touchEvent('touchmove', canvasB, 225, 25));

        // scene B receives it; the main scene must not, even though (225, 25) would miss it anyway -
        // the point is the main boundary is never consulted for the scoped touch
        expect(moveB).toHaveBeenCalledTimes(1);
        expect(moveA).not.toHaveBeenCalled();

        renderer.destroy();
    });
});
