import '~/scene/graphics/init';
import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Container, Graphics } from '~/scene';

import type { EventsViewData } from '../EventSystem';
import type { WebGLRenderer } from '~/rendering';

// These tests prove the F-C fan-out narrowing in EventSystem (skip views that cannot observably
// fire on a native pointermove/pointerup) does NOT change behavior for any view that could fire.
// They run against a real WebGL renderer with multiple DOM-attached canvases at distinct page
// positions, driving synthetic native pointer events exactly as the browser would.

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

// Synthesize the native enter/leave the browser fires on a canvas. The over-flag the fan-out reads
// is maintained from these element-scoped events, so tests must drive them like a real pointer would.
function enterCanvas(canvas: HTMLCanvasElement, clientX: number, clientY: number)
{
    canvas.dispatchEvent(pointerEvent('pointerover', clientX, clientY));
}

function leaveCanvas(canvas: HTMLCanvasElement, clientX: number, clientY: number)
{
    canvas.dispatchEvent(pointerEvent('pointerleave', clientX, clientY));
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

    // canvas B at page (200, 0); canvas C at page (400, 0) - three distinct, non-overlapping views
    const canvasB = createCanvas(200, 0);
    const canvasC = createCanvas(400, 0);

    const viewB = renderer.addView({ canvas: canvasB });
    const viewC = renderer.addView({ canvas: canvasC });

    const sceneA = createScene();
    const sceneB = createScene();
    const sceneC = createScene();

    renderer.render({ container: sceneA.stage });
    renderer.render({ container: sceneB.stage, target: canvasB });
    renderer.render({ container: sceneC.stage, target: canvasC });

    return { renderer, canvasA, canvasB, canvasC, viewB, viewC, sceneA, sceneB, sceneC };
}

function getView(renderer: WebGLRenderer, element: EventTarget): EventsViewData
{
    return renderer.events['_views'].get(element);
}

describe('Multi-view EventSystem fan-out narrowing', () =>
{
    it('keeps delivering moves to a view with an in-flight press even when the pointer leaves its canvas', async () =>
    {
        const { renderer, canvasA, canvasB, sceneB } = await setupMultiView();

        // turn off globalMove so the skip path is exercised; the drag must survive on press tracking
        renderer.events.features.globalMove = false;

        const move = jest.fn();
        const up = jest.fn();
        const upOutside = jest.fn();

        sceneB.graphics.on('pointermove', move);
        sceneB.graphics.on('pointerup', up);
        sceneB.graphics.on('pointerupoutside', upOutside);

        // press on B at its local (25, 25)
        enterCanvas(canvasB, 225, 25);
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        // pointer physically leaves canvas B and moves over canvas A; B must still receive the move
        leaveCanvas(canvasB, 175, 25);
        enterCanvas(canvasA, 25, 25);
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        // the move is over A (B-local -175,25 misses B's geometry), but B's drag is still tracked:
        // its boundary still ran the move (no pointermove on the target since it is a miss for B)
        const viewB = getView(renderer, canvasB);

        expect(viewB.boundary['mappingState'].trackingData[1]).toBeDefined();

        // releasing over A is outside for B; B must still get the pointerupoutside for its press
        canvasA.dispatchEvent(pointerEvent('pointerup', 25, 25));

        expect(upOutside).toHaveBeenCalledTimes(1);
        expect(up).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('delivers the final pointerup to the pressing view even after the pointer dragged onto another canvas', async () =>
    {
        const { renderer, canvasA, canvasB, sceneB } = await setupMultiView();

        renderer.events.features.globalMove = false;

        const upOutside = jest.fn();

        sceneB.graphics.on('pointerupoutside', upOutside);

        // press inside B
        enterCanvas(canvasB, 225, 25);
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        // drag out of B, across to A, several moves
        leaveCanvas(canvasB, 175, 25);
        enterCanvas(canvasA, 25, 25);
        document.dispatchEvent(pointerEvent('pointermove', 30, 30));
        document.dispatchEvent(pointerEvent('pointermove', 40, 40));

        // release over A
        canvasA.dispatchEvent(pointerEvent('pointerup', 40, 40));

        expect(upOutside).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });

    it('still delivers moves to a globalMove view while the pointer is over a different canvas', async () =>
    {
        const { renderer, canvasA, canvasB, sceneB } = await setupMultiView();

        // renderer-wide globalMove stays disabled, but view B opts back in: it must keep getting
        // globalpointermove even when the pointer is physically over canvas A
        renderer.events.features.globalMove = false;
        getView(renderer, canvasB).boundary.enableGlobalMoveEvents = true;

        const globalMove = jest.fn();

        sceneB.graphics.on('globalpointermove', globalMove);

        // pointer is over canvas A, nowhere near B's geometry
        enterCanvas(canvasA, 25, 25);
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        expect(globalMove).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });

    it('fires hover over and out as the pointer enters and leaves each canvas', async () =>
    {
        const { renderer, canvasA, canvasB, sceneA, sceneB } = await setupMultiView();

        renderer.events.features.globalMove = false;

        const overA = jest.fn();
        const outA = jest.fn();
        const overB = jest.fn();
        const outB = jest.fn();

        sceneA.graphics.on('pointerover', overA);
        sceneA.graphics.on('pointerout', outA);
        sceneB.graphics.on('pointerover', overB);
        sceneB.graphics.on('pointerout', outB);

        // enter A over its geometry
        enterCanvas(canvasA, 25, 25);
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));
        expect(overA).toHaveBeenCalledTimes(1);

        // move within A but off the geometry -> out on A
        document.dispatchEvent(pointerEvent('pointermove', 90, 90));
        expect(outA).toHaveBeenCalledTimes(1);

        // physically leave A, enter B over its geometry -> over on B, nothing more on A
        leaveCanvas(canvasA, 105, 25);
        enterCanvas(canvasB, 225, 25);
        document.dispatchEvent(pointerEvent('pointermove', 225, 25));

        expect(overB).toHaveBeenCalledTimes(1);
        expect(overA).toHaveBeenCalledTimes(1);
        expect(outA).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });

    it('fires pointerup on the view the release landed on and not on at-rest views', async () =>
    {
        const { renderer, canvasB, sceneB, sceneC } = await setupMultiView();

        renderer.events.features.globalMove = false;

        const upB = jest.fn();
        const upC = jest.fn();

        sceneB.graphics.on('pointerup', upB);
        sceneC.graphics.on('pointerup', upC);

        // a press + release entirely within B
        enterCanvas(canvasB, 225, 25);
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));
        canvasB.dispatchEvent(pointerEvent('pointerup', 225, 25));

        expect(upB).toHaveBeenCalledTimes(1);
        // C never saw the gesture and the release was not over it
        expect(upC).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('does not dispatch a document move to an at-rest view with no globalMove and no gesture', async () =>
    {
        const { renderer, canvasA, canvasC } = await setupMultiView();

        renderer.events.features.globalMove = false;

        const viewC = getView(renderer, canvasC);

        // put C at rest with the pointer away from it: enter to warm the rect, then leave so C ends
        // hovered=false with a measured rect and no active gesture. The cold-rect path (rect null) is
        // covered separately; there the rect is re-measured in place and the same geometry skip applies.
        enterCanvas(canvasC, 425, 25);
        document.dispatchEvent(pointerEvent('pointermove', 425, 25));
        leaveCanvas(canvasC, 425, 25);

        const mapEventC = jest.spyOn(viewC.boundary, 'mapEvent');

        // pointer is over canvas A; canvas C is at rest (rect cached, no hover, no press, no globalMove)
        enterCanvas(canvasA, 25, 25);
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));
        document.dispatchEvent(pointerEvent('pointermove', 30, 30));

        // C's boundary must be skipped entirely - the whole point of the narrowing
        expect(mapEventC).not.toHaveBeenCalled();

        mapEventC.mockRestore();
        renderer.destroy();
    });

    it('dispatches a move to a view the pointer is already resting over before its rect is measured', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        renderer.events.features.globalMove = false;

        // viewB.over is false and its clientRect is null: no native pointerover fired because the
        // pointer was already resting inside B when the view was added. A document move over B's
        // geometry (canvasB is at page 200,0,100x100) re-measures the cold rect in place and, being
        // inside it, still reaches B.
        const viewB = getView(renderer, canvasB);
        const mapEventB = jest.spyOn(viewB.boundary, 'mapEvent');

        document.dispatchEvent(pointerEvent('pointermove', 225, 25));

        expect(mapEventB).toHaveBeenCalled();

        mapEventB.mockRestore();
        renderer.destroy();
    });

    it('re-measures and skips an at-rest view after a page scroll instead of dispatching to it', async () =>
    {
        const { renderer, canvasA, canvasC } = await setupMultiView();

        renderer.events.features.globalMove = false;

        const viewC = getView(renderer, canvasC);

        // warm C's rect, then leave so it comes to rest with the pointer away from it
        enterCanvas(canvasC, 425, 25);
        document.dispatchEvent(pointerEvent('pointermove', 425, 25));
        leaveCanvas(canvasC, 425, 25);

        // a page scroll invalidates every cached rect. Before the fix the next move cold-started C
        // (clientRect null) and dispatched to it unconditionally; now C is re-measured in place and,
        // because the pointer is over A and outside C, its scene hit-test is skipped.
        window.dispatchEvent(new Event('scroll'));

        const mapEventC = jest.spyOn(viewC.boundary, 'mapEvent');
        const rectC = jest.spyOn(canvasC, 'getBoundingClientRect');

        enterCanvas(canvasA, 25, 25);
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        // the rect is re-measured once (dispatch would have paid the same getBoundingClientRect), but
        // the boundary hit-test never runs for the at-rest view
        expect(rectC.mock.calls.length).toBe(1);
        expect(mapEventC).not.toHaveBeenCalled();

        mapEventC.mockRestore();
        rectC.mockRestore();
        renderer.destroy();
    });

    it('does not dispatch a window up to an at-rest view with no in-flight press', async () =>
    {
        const { renderer, canvasA, canvasC } = await setupMultiView();

        renderer.events.features.globalMove = false;

        const viewC = getView(renderer, canvasC);
        const mapEventC = jest.spyOn(viewC.boundary, 'mapEvent');

        // a press + release on A; C has no press and the up is not over it
        enterCanvas(canvasA, 25, 25);
        canvasA.dispatchEvent(pointerEvent('pointerdown', 25, 25));
        canvasA.dispatchEvent(pointerEvent('pointerup', 25, 25));

        expect(mapEventC).not.toHaveBeenCalled();

        mapEventC.mockRestore();
        renderer.destroy();
    });

    it('preserves the original fan-out: with globalMove on, every move-enabled view still gets the move', async () =>
    {
        const { renderer, canvasA, canvasB, canvasC } = await setupMultiView();

        // default config keeps globalMove enabled, so the conservative path must dispatch to all views
        const mapEventA = jest.spyOn(getView(renderer, canvasA).boundary, 'mapEvent');
        const mapEventB = jest.spyOn(getView(renderer, canvasB).boundary, 'mapEvent');
        const mapEventC = jest.spyOn(getView(renderer, canvasC).boundary, 'mapEvent');

        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        expect(mapEventA).toHaveBeenCalledTimes(1);
        expect(mapEventB).toHaveBeenCalledTimes(1);
        expect(mapEventC).toHaveBeenCalledTimes(1);

        mapEventA.mockRestore();
        mapEventB.mockRestore();
        mapEventC.mockRestore();
        renderer.destroy();
    });

    it('clears hover state with a pointerout when the pointer moves off a hovered view onto another', async () =>
    {
        const { renderer, canvasA, canvasB, sceneB } = await setupMultiView();

        renderer.events.features.globalMove = false;

        const outB = jest.fn();

        sceneB.graphics.on('pointerout', outB);

        // hover B's geometry first so B has overTargets to clear
        enterCanvas(canvasB, 225, 25);
        document.dispatchEvent(pointerEvent('pointermove', 225, 25));

        // pointer physically leaves B and goes to A; B must still receive this move to fire its out,
        // even though the pointer is no longer over B (hover-clear via active move tracking)
        leaveCanvas(canvasB, 175, 25);
        enterCanvas(canvasA, 25, 25);
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));

        expect(outB).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });

    it('keeps the inside view receiving the up and the pressing outside view receiving upoutside together', async () =>
    {
        const { renderer, canvasA, canvasB, sceneA, sceneB } = await setupMultiView();

        renderer.events.features.globalMove = false;

        const upA = jest.fn();
        const upOutsideB = jest.fn();

        sceneA.graphics.on('pointerup', upA);
        sceneB.graphics.on('pointerupoutside', upOutsideB);

        // press starts on B
        enterCanvas(canvasB, 225, 25);
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        // release over A's geometry: A (inside) fires pointerup, B (pressing, outside) fires upoutside
        leaveCanvas(canvasB, 175, 25);
        enterCanvas(canvasA, 25, 25);
        canvasA.dispatchEvent(pointerEvent('pointerup', 25, 25));

        expect(upA).toHaveBeenCalledTimes(1);
        expect(upOutsideB).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });
});
