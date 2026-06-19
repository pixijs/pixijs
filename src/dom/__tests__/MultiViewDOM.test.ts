import { DOMContainer } from '../DOMContainer';
import '../init';
import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Container } from '~/scene';

import type { DOMPipe } from '../DOMPipe';
import type { Renderer } from '~/rendering';

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

function domScene(): { stage: Container; element: HTMLDivElement }
{
    const stage = new Container();
    const element = document.createElement('div');

    stage.addChild(new DOMContainer({ element }));

    return { stage, element };
}

function getPipe(renderer: Renderer): DOMPipe
{
    return renderer.renderPipes.dom;
}

function overlayFor(pipe: DOMPipe, canvas: HTMLCanvasElement): HTMLDivElement
{
    return pipe['_tracker'].get(canvas).overlay;
}

function hasView(pipe: DOMPipe, canvas: HTMLCanvasElement): boolean
{
    return pipe['_tracker'].get(canvas) !== undefined;
}

async function setupMultiView()
{
    const renderer = await getWebGLRenderer({ multiView: true, width: 128, height: 128 });
    const mainCanvas = renderer.canvas as HTMLCanvasElement;

    document.body.appendChild(mainCanvas);
    attachedCanvases.push(mainCanvas);

    const canvasB = attachedCanvas();

    renderer.addView({ canvas: canvasB });

    return { renderer, mainCanvas, canvasB };
}

describe('DOMPipe multiView', () =>
{
    it('positions DOM elements over the canvas their scene was rendered to', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const sceneA = domScene();
        const sceneB = domScene();

        renderer.render({ container: sceneB.stage, target: canvasB });
        renderer.render({ container: sceneA.stage });

        const pipe = getPipe(renderer);
        const mainOverlay = pipe['_domElement'];
        const overlayB = overlayFor(pipe, canvasB);

        expect(sceneA.element.parentNode).toBe(mainOverlay);
        expect(sceneB.element.parentNode).toBe(overlayB);
        expect(overlayB).not.toBe(mainOverlay);

        renderer.destroy();
    });

    it('moves a DOM element to the right overlay when it changes scenes', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const stageA = new Container();
        const stageB = new Container();
        const element = document.createElement('div');
        const dom = new DOMContainer({ element });

        stageA.addChild(dom);

        renderer.render({ container: stageB, target: canvasB });
        renderer.render({ container: stageA });

        const pipe = getPipe(renderer);

        expect(element.parentNode).toBe(pipe['_domElement']);

        // move the container into the secondary scene; the overlay should follow
        stageA.removeChild(dom);
        stageB.addChild(dom);

        renderer.render({ container: stageB, target: canvasB });
        renderer.render({ container: stageA });

        expect(element.parentNode).toBe(overlayFor(pipe, canvasB));

        renderer.destroy();
    });

    it('removes a secondary overlay when its source is destroyed', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const sceneB = domScene();

        renderer.render({ container: sceneB.stage, target: canvasB });

        const pipe = getPipe(renderer);

        expect(hasView(pipe, canvasB)).toBe(true);

        renderer.renderTarget.getRenderTarget(canvasB).colorTexture.destroy();

        expect(hasView(pipe, canvasB)).toBe(false);

        renderer.destroy();
    });

    it('does not create an overlay for a view that opts out of DOM rendering', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, width: 128, height: 128 });

        document.body.appendChild(renderer.canvas as HTMLCanvasElement);
        attachedCanvases.push(renderer.canvas as HTMLCanvasElement);

        const canvasB = attachedCanvas();

        renderer.addView({ canvas: canvasB, dom: false });

        const sceneB = domScene();

        renderer.render({ container: sceneB.stage, target: canvasB });

        const pipe = getPipe(renderer);

        expect(hasView(pipe, canvasB)).toBe(false);

        renderer.destroy();
    });

    // WebGPU drives each canvas through its own GPUCanvasContext (no multiView option); the per-canvas
    // overlay logic is backend-agnostic, so it must place DOM elements over the right canvas here too
    itLocalOnly('places DOM elements per canvas on the WebGPU renderer', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 128, height: 128 });

        document.body.appendChild(renderer.canvas as HTMLCanvasElement);
        attachedCanvases.push(renderer.canvas as HTMLCanvasElement);

        const canvasB = attachedCanvas();

        renderer.addView({ canvas: canvasB });

        const sceneA = domScene();
        const sceneB = domScene();

        renderer.render({ container: sceneB.stage, target: canvasB });
        renderer.render({ container: sceneA.stage });

        const pipe = getPipe(renderer);

        expect(sceneA.element.parentNode).toBe(pipe['_domElement']);
        expect(sceneB.element.parentNode).toBe(overlayFor(pipe, canvasB));

        renderer.destroy();
    });
});
