import '~/scene/graphics/init';
import { EventsTicker } from '../EventTicker';
import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Container, Graphics } from '~/scene';

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

async function setupMultiView()
{
    const renderer = await getWebGLRenderer({
        width: 100,
        height: 100,
        multiView: true,
    });

    // place the main canvas and the secondary canvas at known positions
    const canvasA = renderer.canvas as HTMLCanvasElement;

    canvasA.style.cssText = 'position: fixed; left: 0px; top: 0px; width: 100px; height: 100px;';
    document.body.appendChild(canvasA);
    attachedCanvases.push(canvasA);

    const canvasB = createCanvas(200, 0);

    // secondary canvases are registered explicitly through the canvas view registry
    const viewB = renderer.addView({ canvas: canvasB });

    const sceneA = createScene();
    const sceneB = createScene();

    renderer.render({ container: sceneA.stage });
    renderer.render({ container: sceneB.stage, target: canvasB });

    return { renderer, canvasA, canvasB, viewB, sceneA, sceneB };
}

function getView(renderer: WebGLRenderer, element: EventTarget): EventsViewData
{
    return renderer.events['_views'].get(element);
}

describe('Multi-view EventSystem', () =>
{
    it('should register a view when a target canvas is added', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const view = getView(renderer, canvasB);

        expect(view).toBeDefined();
        expect(view.boundary).not.toBe(renderer.events.rootBoundary);

        renderer.destroy();
    });

    it('should remove the view when it is removed from the renderer', async () =>
    {
        const { renderer, canvasB, viewB } = await setupMultiView();

        expect(getView(renderer, canvasB)).toBeDefined();

        renderer.removeView(viewB);

        expect(getView(renderer, canvasB)).toBeUndefined();

        renderer.destroy();
    });

    it('should keep the main view on the rootBoundary', async () =>
    {
        const { renderer } = await setupMultiView();

        const view = getView(renderer, renderer.canvas);

        expect(view.boundary).toBe(renderer.events.rootBoundary);

        renderer.destroy();
    });

    it('should wire a fresh per-view boundary for addView without an Application', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 100,
            height: 100,
            multiView: true,
        });

        const canvasB = createCanvas(200, 0);
        const viewB = renderer.addView({ canvas: canvasB });

        const boundary = renderer.events.boundaryForElement(canvasB);

        // a registered view resolves to its own boundary, separate from the main/root one
        expect(boundary).toBe(getView(renderer, canvasB).boundary);
        expect(boundary).not.toBe(renderer.events.rootBoundary);

        renderer.removeView(viewB);

        // once removed, the element is unknown and falls back to the main view's boundary
        expect(renderer.events.boundaryForElement(canvasB)).toBe(renderer.events.rootBoundary);

        renderer.destroy();
    });

    it('should start the events ticker when the renderer initializes', async () =>
    {
        const { renderer } = await setupMultiView();

        expect(EventsTicker.domElement).toBe(renderer.canvas);
        expect(EventsTicker['_tickerAdded']).toBe(true);

        renderer.destroy();
    });

    it('should hit-test real pointerdown events against the target canvas scene', async () =>
    {
        const { renderer, canvasB, sceneA, sceneB } = await setupMultiView();

        const spyA = jest.fn();
        const spyB = jest.fn();

        sceneA.graphics.on('pointerdown', spyA);
        sceneB.graphics.on('pointerdown', spyB);

        // canvas B sits at page (200, 0), so client (225, 25) is local (25, 25)
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        expect(spyB).toHaveBeenCalledTimes(1);
        expect(spyB.mock.calls[0][0].global.x).toBe(25);
        expect(spyB.mock.calls[0][0].global.y).toBe(25);
        expect(spyA).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('should fan document-level moves out to every view with per-view coordinates', async () =>
    {
        const { renderer, sceneA, sceneB } = await setupMultiView();

        const spyA = jest.fn();
        const spyB = jest.fn();

        sceneA.graphics.on('pointermove', spyA);
        sceneB.graphics.on('pointermove', spyB);

        // client (25, 25): inside scene A's graphics, and (-175, 25) for view B - a miss
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        expect(spyA).toHaveBeenCalledTimes(1);
        expect(spyB).not.toHaveBeenCalled();

        // client (225, 25): a miss for A, a hit at (25, 25) for B
        document.dispatchEvent(pointerEvent('pointermove', 225, 25));

        expect(spyA).toHaveBeenCalledTimes(1);
        expect(spyB).toHaveBeenCalledTimes(1);
        expect(spyB.mock.calls[0][0].global.x).toBe(25);

        renderer.destroy();
    });

    it('should dispatch pointerupoutside on views that did not receive the up', async () =>
    {
        const { renderer, canvasA, canvasB, sceneB } = await setupMultiView();

        const upOutside = jest.fn();
        const up = jest.fn();

        sceneB.graphics.on('pointerupoutside', upOutside);
        sceneB.graphics.on('pointerup', up);

        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        // released over canvas A: outside for view B
        canvasA.dispatchEvent(pointerEvent('pointerup', 25, 25));

        expect(upOutside).toHaveBeenCalledTimes(1);
        expect(up).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('should dispatch pointerup on the view that received the up', async () =>
    {
        const { renderer, canvasB, sceneB } = await setupMultiView();

        const up = jest.fn();

        sceneB.graphics.on('pointerup', up);

        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));
        canvasB.dispatchEvent(pointerEvent('pointerup', 225, 25));

        expect(up).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });

    it('should route wheel events to the view they occurred on', async () =>
    {
        const { renderer, canvasB, sceneA, sceneB } = await setupMultiView();

        const spyA = jest.fn();
        const spyB = jest.fn();

        sceneA.graphics.on('wheel', spyA);
        sceneB.graphics.on('wheel', spyB);

        canvasB.dispatchEvent(new WheelEvent('wheel', {
            clientX: 225,
            clientY: 25,
            deltaY: 10,
            bubbles: true,
        }));

        expect(spyB).toHaveBeenCalledTimes(1);
        expect(spyA).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('should synthesize over and out per view from document moves', async () =>
    {
        const { renderer, sceneB } = await setupMultiView();

        const over = jest.fn();
        const out = jest.fn();

        sceneB.graphics.on('pointerover', over);
        sceneB.graphics.on('pointerout', out);

        document.dispatchEvent(pointerEvent('pointermove', 225, 25));
        expect(over).toHaveBeenCalledTimes(1);

        document.dispatchEvent(pointerEvent('pointermove', 225, 90));
        expect(out).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });

    it('should apply cursors to the hovered view only', async () =>
    {
        const { renderer, canvasA, canvasB, sceneB } = await setupMultiView();

        sceneB.graphics.cursor = 'pointer';

        document.dispatchEvent(pointerEvent('pointermove', 225, 25));

        expect(canvasB.style.cursor).toBe('pointer');
        expect(canvasA.style.cursor).not.toBe('pointer');

        renderer.destroy();
    });

    it('should keep the public pointer state in the main view coordinate space', async () =>
    {
        const { renderer } = await setupMultiView();

        document.dispatchEvent(pointerEvent('pointermove', 25, 30));

        // mapped through the main canvas at (0, 0), not the secondary at (200, 0)
        expect(renderer.events.pointer.global.x).toBe(25);
        expect(renderer.events.pointer.global.y).toBe(30);

        renderer.destroy();
    });

    it('should map coordinates per view using the view resolution', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 100,
            height: 100,
            multiView: true,
        });

        // a 100px css canvas; addView at resolution 2 resizes the backing store to 200px
        const canvasB = createCanvas(0, 0, 100, 100);

        renderer.addView({ canvas: canvasB, resolution: 2 });

        const sceneB = createScene();
        const spy = jest.fn();

        sceneB.graphics.on('pointerdown', spy);

        renderer.render({ container: sceneB.stage, target: canvasB });

        // client (30, 30) on a 100px css / 200px backing canvas at resolution 2 -> world (30, 30)
        canvasB.dispatchEvent(pointerEvent('pointerdown', 30, 30));

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0].global.x).toBe(30);
        expect(spy.mock.calls[0][0].global.y).toBe(30);

        renderer.destroy();
    });

    it('should not register a view that opts out of events', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 100,
            height: 100,
            multiView: true,
        });

        const canvasB = createCanvas(200, 0);

        renderer.addView({ canvas: canvasB, events: false });

        // no per-view data exists, and the canvas is not in the pointer fan-out snapshot
        expect(getView(renderer, canvasB)).toBeUndefined();
        expect(renderer.events['_viewsList'].some((view) => view.element === canvasB)).toBe(false);

        // an unknown element falls back to the main view, which owns the rootBoundary
        expect(renderer.events.boundaryForElement(canvasB)).toBe(renderer.events.rootBoundary);

        renderer.destroy();
    });

    it('should not fan moves out to a view that disables the move feature', async () =>
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

        // view B disables move hit-testing; the main view keeps it
        const canvasB = createCanvas(200, 0);

        renderer.addView({ canvas: canvasB, eventFeatures: { move: false } });

        const sceneA = createScene();
        const sceneB = createScene();

        renderer.render({ container: sceneA.stage });
        renderer.render({ container: sceneB.stage, target: canvasB });

        const moveA = jest.fn();
        const moveB = jest.fn();

        sceneA.graphics.on('pointermove', moveA);
        sceneB.graphics.on('pointermove', moveB);

        // a hit for view A at its local (25, 25)
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));
        // a hit for view B's geometry at its local (25, 25), but move is disabled there
        document.dispatchEvent(pointerEvent('pointermove', 225, 25));

        expect(moveA).toHaveBeenCalledTimes(1);
        expect(moveB).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('should honor per-view eventFeatures overrides', async () =>
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

        // view B opts out of click events; view A (main) keeps them
        renderer.addView({ canvas: canvasB, eventFeatures: { click: false } });

        const sceneA = createScene();
        const sceneB = createScene();

        renderer.render({ container: sceneA.stage });
        renderer.render({ container: sceneB.stage, target: canvasB });

        const downA = jest.fn();
        const downB = jest.fn();

        sceneA.graphics.on('pointerdown', downA);
        sceneB.graphics.on('pointerdown', downB);

        canvasA.dispatchEvent(pointerEvent('pointerdown', 25, 25));
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        expect(downA).toHaveBeenCalledTimes(1);
        expect(downB).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('should remove the view when its canvas source is destroyed', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const view = getView(renderer, canvasB);

        expect(view).toBeDefined();

        const source = view.source;

        source.destroy();

        expect(getView(renderer, canvasB)).toBeUndefined();

        renderer.destroy();
    });

    it('should not re-register the main canvas after setTargetElement(null)', async () =>
    {
        const { renderer, sceneA } = await setupMultiView();

        renderer.events.setTargetElement(null);

        renderer.render({ container: sceneA.stage });

        expect(getView(renderer, renderer.canvas)).toBeUndefined();
        expect(renderer.events.domElement).toBeNull();

        renderer.destroy();
    });

    it('should track the last container rendered to each view', async () =>
    {
        const { renderer, canvasB, sceneB } = await setupMultiView();

        expect(getView(renderer, canvasB).rootContainer).toBe(sceneB.stage);

        const otherScene = createScene();

        renderer.render({ container: otherScene.stage, target: canvasB });

        expect(getView(renderer, canvasB).rootContainer).toBe(otherScene.stage);

        renderer.destroy();
    });

    it('should propagate globalMove feature changes to all view boundaries', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        renderer.events.features.globalMove = false;

        expect(getView(renderer, canvasB).boundary.enableGlobalMoveEvents).toBe(false);
        expect(renderer.events.rootBoundary.enableGlobalMoveEvents).toBe(false);

        renderer.events.features.globalMove = true;

        expect(getView(renderer, canvasB).boundary.enableGlobalMoveEvents).toBe(true);

        renderer.destroy();
    });

    it('should register views before the back buffer swaps the render target', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 100,
            height: 100,
            multiView: true,
            useBackBuffer: true,
        });

        const canvasB = createCanvas(200, 0);

        renderer.addView({ canvas: canvasB });

        const sceneB = createScene();

        renderer.render({ container: sceneB.stage, target: canvasB });

        const view = getView(renderer, canvasB);

        expect(view).toBeDefined();
        expect(view.rootContainer).toBe(sceneB.stage);

        renderer.destroy();
    });

    it('should not auto-create a view for a secondary render target without addView', async () =>
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

        // rendered to directly, with no addView registration
        const canvasB = createCanvas(200, 0);
        const sceneB = createScene();
        const downB = jest.fn();

        sceneB.graphics.on('pointerdown', downB);

        renderer.render({ container: sceneB.stage, target: canvasB });

        // only the main view is registered; the secondary target did not auto-register
        expect(getView(renderer, canvasB)).toBeUndefined();
        expect(renderer.events['_views'].size).toBe(1);
        expect(renderer.events.boundaryForElement(canvasB)).toBe(renderer.events.rootBoundary);

        // and no scoped listener exists on canvas B, so events on it do not hit-test its scene
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        expect(downB).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('should clean up all views on destroy', async () =>
    {
        const { renderer } = await setupMultiView();

        const views = renderer.events['_views'];

        expect(views.size).toBe(2);

        renderer.destroy();

        expect(views.size).toBe(0);
    });

    it('should keep a view\'s globalMove opt-out when the renderer-wide feature is enabled', async () =>
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

        // start with the renderer-wide globalMove disabled so the toggle below is a real change
        renderer.events.features.globalMove = false;

        const canvasB = createCanvas(200, 0);

        // view B opts out of globalMove; view A (main) follows the renderer-wide feature
        renderer.addView({ canvas: canvasB, eventFeatures: { globalMove: false } });

        const viewB = getView(renderer, canvasB);

        expect(viewB.boundary.enableGlobalMoveEvents).toBe(false);

        // enabling the renderer-wide feature must NOT clobber view B's per-view opt-out
        renderer.events.features.globalMove = true;

        expect(viewB.boundary.enableGlobalMoveEvents).toBe(false);
        // the main view references the live features object, so it picks up the new value
        expect(renderer.events.rootBoundary.enableGlobalMoveEvents).toBe(true);

        renderer.destroy();
    });

    it('should cache the client rect across moves and invalidate it on scroll/resize', async () =>
    {
        const { renderer, canvasA, canvasB } = await setupMultiView();

        const spyA = jest.spyOn(canvasA, 'getBoundingClientRect');
        const spyB = jest.spyOn(canvasB, 'getBoundingClientRect');

        // several moves over both move-enabled views should map from the cached rect: at most one
        // getBoundingClientRect per view across all of them
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));
        document.dispatchEvent(pointerEvent('pointermove', 30, 30));
        document.dispatchEvent(pointerEvent('pointermove', 225, 40));

        expect(spyA.mock.calls.length).toBeLessThanOrEqual(1);
        expect(spyB.mock.calls.length).toBeLessThanOrEqual(1);

        const callsAfterCache = spyA.mock.calls.length;

        // a page scroll invalidates every view's cache, so the next move re-measures
        window.dispatchEvent(new Event('scroll'));
        document.dispatchEvent(pointerEvent('pointermove', 35, 35));

        expect(spyA.mock.calls.length).toBe(callsAfterCache + 1);

        // a window resize likewise invalidates the cache
        const callsAfterScroll = spyA.mock.calls.length;

        window.dispatchEvent(new Event('resize'));
        document.dispatchEvent(pointerEvent('pointermove', 40, 40));

        expect(spyA.mock.calls.length).toBe(callsAfterScroll + 1);

        spyA.mockRestore();
        spyB.mockRestore();

        renderer.destroy();
    });

    it('should map with fresh coordinates after the cache is invalidated', async () =>
    {
        const { renderer, canvasA, sceneA } = await setupMultiView();

        const move = jest.fn();

        sceneA.graphics.on('pointermove', move);

        // prime the cache against the canvas at (0, 0): client (25, 25) -> local (25, 25)
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        expect(move).toHaveBeenCalledTimes(1);
        expect(move.mock.calls[0][0].global.x).toBe(25);

        // move the canvas, then invalidate via a scroll so the next move re-measures the new rect
        canvasA.style.left = '40px';
        window.dispatchEvent(new Event('scroll'));

        // client (65, 25) on a canvas now at left 40 -> local (25, 25) only if the rect was refreshed
        document.dispatchEvent(pointerEvent('pointermove', 65, 25));

        expect(move).toHaveBeenCalledTimes(2);
        expect(move.mock.calls[1][0].global.x).toBe(25);

        renderer.destroy();
    });
});
