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

function getPipe(renderer: Renderer): DOMPipe
{
    return renderer.renderPipes.dom;
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

describe('DOMPipe reparent detach', () =>
{
    it('detaches an element from view A\'s overlay when it reparents to a paused view B', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const stageA = new Container();
        const stageB = new Container();

        // `moved` is laid into A's overlay; `stays` keeps belonging to A as a control
        const movedElement = document.createElement('div');
        const staysElement = document.createElement('div');
        const moved = new DOMContainer({ element: movedElement });
        const stays = new DOMContainer({ element: staysElement });

        stageA.addChild(moved, stays);

        const pipe = getPipe(renderer);
        const overlayA = pipe['_domElement'];

        // seed view B's overlay so it exists, then render A: both elements land in A's overlay
        renderer.render({ container: stageB, target: canvasB });
        renderer.render({ container: stageA });

        expect(movedElement.parentNode).toBe(overlayA);
        expect(staysElement.parentNode).toBe(overlayA);

        // reparent `moved` under view B's scene in the scene graph, but DO NOT render B
        // (B is disabled/paused), so B never re-parents the element onto its own overlay
        stageA.removeChild(moved);
        stageB.addChild(moved);

        // render ONLY A again
        renderer.render({ container: stageA });

        // `moved` no longer belongs to A's scene, so it must be detached from A's overlay
        // (before the fix it stays parented in A's overlay with a stale transform)
        expect(movedElement.parentNode).not.toBe(overlayA);
        expect(movedElement.parentNode).toBe(null);

        // `stays` still belongs to A, so it must remain in A's overlay (no over-eager detach)
        expect(staysElement.parentNode).toBe(overlayA);

        renderer.destroy();
    });

    // WebGPU drives each canvas through its own GPUCanvasContext; the detach logic is backend-agnostic
    itLocalOnly('detaches a reparented element from a paused view on the WebGPU renderer', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 128, height: 128 });

        document.body.appendChild(renderer.canvas as HTMLCanvasElement);
        attachedCanvases.push(renderer.canvas as HTMLCanvasElement);

        const canvasB = attachedCanvas();

        renderer.addView({ canvas: canvasB });

        const stageA = new Container();
        const stageB = new Container();
        const movedElement = document.createElement('div');
        const staysElement = document.createElement('div');

        stageA.addChild(new DOMContainer({ element: movedElement }));
        const moved = stageA.children[0] as DOMContainer;

        stageA.addChild(new DOMContainer({ element: staysElement }));

        const pipe = getPipe(renderer);
        const overlayA = pipe['_domElement'];

        renderer.render({ container: stageB, target: canvasB });
        renderer.render({ container: stageA });

        expect(movedElement.parentNode).toBe(overlayA);
        expect(staysElement.parentNode).toBe(overlayA);

        stageA.removeChild(moved);
        stageB.addChild(moved);

        renderer.render({ container: stageA });

        expect(movedElement.parentNode).not.toBe(overlayA);
        expect(staysElement.parentNode).toBe(overlayA);

        renderer.destroy();
    });
});
