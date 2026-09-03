import '../init';
import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Rectangle } from '~/maths';
import { RenderTexture } from '~/rendering';
import { Container } from '~/scene';

const attachedCanvases: HTMLCanvasElement[] = [];

function attachedCanvas(width = 128, height = 128): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    attachedCanvases.push(canvas);

    return canvas;
}

afterEach(() =>
{
    attachedCanvases.forEach((canvas) => canvas.remove());
    attachedCanvases.length = 0;
});

function accessibleChild(): Container
{
    const container = new Container();

    container.accessible = true;
    container.hitArea = new Rectangle(0, 0, 10, 10);

    return container;
}

async function setupMultiView()
{
    const renderer = await getWebGLRenderer({ multiView: true, width: 128, height: 128 });
    const mainCanvas = renderer.canvas as HTMLCanvasElement;

    document.body.appendChild(mainCanvas);
    attachedCanvases.push(mainCanvas);

    const canvasB = attachedCanvas();

    renderer.addView({ canvas: canvasB });

    const system = renderer.accessibility;

    system.setAccessibilityEnabled(true);

    const stageA = new Container();
    const childA = accessibleChild();

    stageA.addChild(childA);

    const stageB = new Container();
    const childB = accessibleChild();

    stageB.addChild(childB);

    return { renderer, canvasB, system, stageA, childA, stageB, childB };
}

describe('AccessibilitySystem multiView', () =>
{
    it('creates a separate overlay per canvas and parents each child to the right one', async () =>
    {
        const { renderer, canvasB, system, stageA, childA, stageB, childB } = await setupMultiView();

        renderer.render({ container: stageA });
        renderer.render({ container: stageB, target: canvasB });

        const views = system['_tracker'];

        expect(views.size).toBe(2);
        expect(childA._accessibleDiv).toBeTruthy();
        expect(childB._accessibleDiv).toBeTruthy();
        expect(childA._accessibleDiv.parentNode).toBe(system['_tracker'].mainView.div);
        expect(childB._accessibleDiv.parentNode).toBe(views.get(canvasB).div);
        expect(childB._accessibleDiv.parentNode).not.toBe(system['_tracker'].mainView.div);

        renderer.destroy();
    });

    it('does not garbage-collect another canvas\'s overlay when rendering', async () =>
    {
        const { renderer, canvasB, system, stageA, stageB, childB } = await setupMultiView();

        renderer.render({ container: stageA });
        renderer.render({ container: stageB, target: canvasB });

        const divB = childB._accessibleDiv;

        // re-render only the main canvas; the secondary canvas's child must survive
        renderer.render({ container: stageA });
        renderer.render({ container: stageA });

        expect(childB._accessibleActive).toBe(true);
        expect(childB._accessibleDiv).toBe(divB);
        expect(system['_tracker'].get(canvasB).children).toContain(childB);

        renderer.destroy();
    });

    it('routes accessible div events to the owning canvas\'s boundary and root', async () =>
    {
        const { renderer, canvasB, childA, stageA, stageB, childB } = await setupMultiView();

        renderer.render({ container: stageA });
        renderer.render({ container: stageB, target: canvasB });

        const events = renderer.events;
        const mainBoundary = events.boundaryForElement(renderer.canvas);
        const boundaryB = events.boundaryForElement(canvasB);

        // each canvas has its own boundary; the main canvas keeps the root boundary
        expect(mainBoundary).toBe(events.rootBoundary);
        expect(boundaryB).not.toBe(events.rootBoundary);
        expect(events.rootTargetForElement(canvasB)).toBe(stageB);

        const dispatchSpy = jest.spyOn(boundaryB, 'dispatchEvent');

        childB._accessibleDiv.dispatchEvent(new MouseEvent('click'));

        expect(dispatchSpy).toHaveBeenCalled();
        expect(boundaryB.rootTarget).toBe(stageB);
        // sanity: the main child belongs to the main scene's overlay
        expect(childA._accessibleDiv.parentNode).toBe(renderer.accessibility['_tracker'].mainView.div);

        renderer.destroy();
    });

    it('resolves a secondary view\'s own canvas dimensions for hit-area clamping', async () =>
    {
        const { renderer, canvasB, system, stageA, stageB } = await setupMultiView();

        renderer.render({ container: stageA });
        renderer.render({ container: stageB, target: canvasB });

        // the secondary view clamps to its own source dimensions, not the renderer's main view
        expect(system['_tracker'].get(canvasB).source.width).toBe(128);

        renderer.destroy();
    });

    it('removes a canvas overlay when its source is destroyed', async () =>
    {
        const { renderer, canvasB, system, stageA, stageB } = await setupMultiView();

        renderer.render({ container: stageA });
        renderer.render({ container: stageB, target: canvasB });

        expect(Boolean(system['_tracker'].get(canvasB))).toBe(true);

        renderer.renderTarget.getRenderTarget(canvasB).colorTexture.destroy();

        expect(Boolean(system['_tracker'].get(canvasB))).toBe(false);

        renderer.destroy();
    });

    it('creates no overlay for a view registered with accessibility:false', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, width: 128, height: 128 });
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const canvasB = attachedCanvas();

        renderer.addView({ canvas: canvasB, accessibility: false });

        const system = renderer.accessibility;

        system.setAccessibilityEnabled(true);

        const stageA = new Container();
        const childA = accessibleChild();

        stageA.addChild(childA);

        const stageB = new Container();
        const childB = accessibleChild();

        stageB.addChild(childB);

        renderer.render({ container: stageA });
        renderer.render({ container: stageB, target: canvasB });

        // the opted-out canvas never gets an overlay, and its accessible child stays inert
        expect(Boolean(system['_tracker'].get(canvasB))).toBe(false);
        expect(childB._accessibleDiv).toBeNull();
        expect(childB._accessibleActive).toBeFalsy();

        // the main canvas is unaffected and still overlays its child
        expect(childA._accessibleDiv).toBeTruthy();
        expect(childA._accessibleDiv.parentNode).toBe(system['_tracker'].mainView.div);

        renderer.destroy();
    });

    it('updates the main overlay even when useBackBuffer swaps the render target', async () =>
    {
        // GlBackBufferSystem.renderStart swaps options.target to a back-buffer texture; accessibility
        // must capture the canvas in prerender (before the swap), not read options.target in postrender
        const renderer = await getWebGLRenderer({ useBackBuffer: true });
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const system = renderer.accessibility;

        system.setAccessibilityEnabled(true);

        const stage = new Container();
        const child = accessibleChild();

        stage.addChild(child);
        renderer.render({ container: stage });

        expect(child._accessibleDiv).toBeTruthy();
        expect(child._accessibleDiv.parentNode).toBe(system.div);

        renderer.destroy();
    });

    it('still works as a single-canvas overlay with no render target argument', async () =>
    {
        const renderer = await getWebGLRenderer();
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const system = renderer.accessibility;

        system.setAccessibilityEnabled(true);

        const stage = new Container();
        const child = accessibleChild();

        stage.addChild(child);
        renderer.render({ container: stage });

        expect(system['_tracker'].size).toBe(1);
        expect(child._accessibleDiv.parentNode).toBe(system.div);

        renderer.destroy();
    });

    it('does not re-lay-out the main overlay when rendering to an offscreen RenderTexture', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 128, height: 128 });
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const system = renderer.accessibility;

        system.setAccessibilityEnabled(true);

        const stage = new Container();
        const child = accessibleChild();

        stage.addChild(child);

        // lay the main overlay out once against the on-screen canvas
        renderer.render({ container: stage });

        const div = child._accessibleDiv;

        expect(div).toBeTruthy();
        expect(div.parentNode).toBe(system['_tracker'].mainView.div);

        const left = div.style.left;
        const top = div.style.top;

        // the offscreen render has no registered view, so prerender resolves a null active view and
        // postrender must early-return instead of re-laying-out the (stale-rooted) main overlay
        const updateViewSpy = jest.spyOn(system as any, '_updateView');
        const texture = RenderTexture.create({ width: 64, height: 64 });

        renderer.render({ container: new Container(), target: texture });

        expect(updateViewSpy).not.toHaveBeenCalled();
        // the main overlay div is untouched: same parent, same position
        expect(child._accessibleDiv).toBe(div);
        expect(div.parentNode).toBe(system['_tracker'].mainView.div);
        expect(div.style.left).toBe(left);
        expect(div.style.top).toBe(top);

        updateViewSpy.mockRestore();
        texture.destroy(true);
        renderer.destroy();
    });

    it('still updates the main overlay on the next on-screen render after an offscreen render', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 128, height: 128 });
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const system = renderer.accessibility;

        system.setAccessibilityEnabled(true);

        const stage = new Container();
        const child = accessibleChild();

        stage.addChild(child);
        renderer.render({ container: stage });

        const texture = RenderTexture.create({ width: 64, height: 64 });

        renderer.render({ container: new Container(), target: texture });

        // the main overlay must resume updating once an on-screen render targets it again
        const updateViewSpy = jest.spyOn(system as any, '_updateView');

        renderer.render({ container: stage });

        expect(updateViewSpy).toHaveBeenCalledTimes(1);
        expect(child._accessibleDiv.parentNode).toBe(system['_tracker'].mainView.div);

        updateViewSpy.mockRestore();
        texture.destroy(true);
        renderer.destroy();
    });

    // the per-canvas overlay logic is backend-agnostic; verify it on WebGPU (no multiView option needed)
    itLocalOnly('creates a separate overlay per canvas on the WebGPU renderer', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 128, height: 128 });
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const canvasB = attachedCanvas();

        renderer.addView({ canvas: canvasB });

        const system = renderer.accessibility;

        system.setAccessibilityEnabled(true);

        const stageA = new Container();
        const childA = accessibleChild();

        stageA.addChild(childA);

        const stageB = new Container();
        const childB = accessibleChild();

        stageB.addChild(childB);

        renderer.render({ container: stageA });
        renderer.render({ container: stageB, target: canvasB });

        expect(system['_tracker'].size).toBe(2);
        expect(childA._accessibleDiv.parentNode).toBe(system['_tracker'].mainView.div);
        expect(childB._accessibleDiv.parentNode).toBe(system['_tracker'].get(canvasB).div);

        renderer.destroy();
    });
});
