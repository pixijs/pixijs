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

function domScene(): { stage: Container; dom: DOMContainer; element: HTMLDivElement }
{
    const stage = new Container();
    const element = document.createElement('div');
    const dom = new DOMContainer({ element });

    stage.addChild(dom);

    return { stage, dom, element };
}

function getPipe(renderer: Renderer): DOMPipe
{
    return renderer.renderPipes.dom;
}

function attachedList(pipe: DOMPipe): DOMContainer[]
{
    return pipe['_attachedDomElements'];
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

describe('DOMPipe multiView visibility', () =>
{
    it('removes the DOM element of a container hidden on a paused canvas', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const sceneA = domScene();
        const sceneB = domScene();

        renderer.render({ container: sceneB.stage, target: canvasB });
        renderer.render({ container: sceneA.stage });

        const pipe = getPipe(renderer);

        expect(sceneB.element.parentNode).not.toBeNull();
        expect(attachedList(pipe)).toContain(sceneB.dom);

        // canvasB is now paused; hiding sceneB must still detach its element on the next main render
        sceneB.dom.visible = false;

        renderer.render({ container: sceneA.stage });

        expect(sceneB.element.parentNode).toBeNull();
        expect(attachedList(pipe)).not.toContain(sceneB.dom);

        renderer.destroy();
    });

    it('removes the DOM element of a container made non-renderable on a paused canvas', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const sceneA = domScene();
        const sceneB = domScene();

        renderer.render({ container: sceneB.stage, target: canvasB });
        renderer.render({ container: sceneA.stage });

        const pipe = getPipe(renderer);

        expect(sceneB.element.parentNode).not.toBeNull();

        sceneB.dom.renderable = false;

        renderer.render({ container: sceneA.stage });

        expect(sceneB.element.parentNode).toBeNull();
        expect(attachedList(pipe)).not.toContain(sceneB.dom);

        renderer.destroy();
    });

    it('does NOT remove a still-visible element on a paused canvas', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const sceneA = domScene();
        const sceneB = domScene();

        renderer.render({ container: sceneB.stage, target: canvasB });
        renderer.render({ container: sceneA.stage });

        const pipe = getPipe(renderer);

        expect(sceneB.element.parentNode).not.toBeNull();

        // render only the main canvas across several frames; sceneB stays visible+renderable
        renderer.render({ container: sceneA.stage });
        renderer.render({ container: sceneA.stage });

        expect(sceneB.element.parentNode).not.toBeNull();
        expect(attachedList(pipe)).toContain(sceneB.dom);

        renderer.destroy();
    });

    it('still hides a visible=false element on the active canvas', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 128, height: 128 });

        document.body.appendChild(renderer.canvas as HTMLCanvasElement);
        attachedCanvases.push(renderer.canvas as HTMLCanvasElement);

        const sceneA = domScene();

        renderer.render({ container: sceneA.stage });

        const pipe = getPipe(renderer);

        expect(sceneA.element.parentNode).not.toBeNull();

        sceneA.dom.visible = false;

        renderer.render({ container: sceneA.stage });

        expect(sceneA.element.parentNode).toBeNull();
        expect(attachedList(pipe)).not.toContain(sceneA.dom);

        renderer.destroy();
    });

    it('a re-shown container re-attaches after its scene renders again', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const sceneA = domScene();
        const sceneB = domScene();

        renderer.render({ container: sceneB.stage, target: canvasB });
        renderer.render({ container: sceneA.stage });

        const pipe = getPipe(renderer);

        // hide sceneB and let the main canvas render to detach it
        sceneB.dom.visible = false;
        renderer.render({ container: sceneA.stage });

        expect(sceneB.element.parentNode).toBeNull();
        expect(attachedList(pipe)).not.toContain(sceneB.dom);

        // re-show and render canvasB again; the element should re-attach to canvasB's overlay
        sceneB.dom.visible = true;
        renderer.render({ container: sceneB.stage, target: canvasB });

        expect(sceneB.element.parentNode).not.toBeNull();
        expect(attachedList(pipe)).toContain(sceneB.dom);

        renderer.destroy();
    });

    itLocalOnly('removes the DOM element of a container hidden on a paused canvas (WebGPU)', async () =>
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

        expect(sceneB.element.parentNode).not.toBeNull();

        sceneB.dom.visible = false;

        renderer.render({ container: sceneA.stage });

        expect(sceneB.element.parentNode).toBeNull();
        expect(attachedList(pipe)).not.toContain(sceneB.dom);

        renderer.destroy();
    });
});
