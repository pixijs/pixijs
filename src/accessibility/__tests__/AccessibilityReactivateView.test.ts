import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Rectangle } from '~/maths';
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

describe('AccessibilitySystem secondary view reactivation', () =>
{
    it('keeps a secondary view\'s observer bound to its own canvas across deactivate/reactivate', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, width: 128, height: 128 });
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const canvasB = attachedCanvas();

        renderer.addView({ canvas: canvasB });

        const system = renderer.accessibility;

        system.setAccessibilityEnabled(true);

        const stageB = new Container();

        stageB.addChild(accessibleChild());

        renderer.render({ container: stageB, target: canvasB });

        // the secondary view's overlay observer is bound to canvasB, not the main canvas
        expect(system['_tracker'].get(canvasB).observer.canvas).toBe(canvasB);
        expect(system['_tracker'].get(canvasB).observer.canvas).not.toBe(renderer.canvas);

        // deactivate then reactivate; the secondary view stays registered and rebuilds its overlay
        system.setAccessibilityEnabled(false);
        system.setAccessibilityEnabled(true);

        renderer.render({ container: stageB, target: canvasB });

        // after reactivation the rebuilt observer must still bind to canvasB. Before the fix
        // (_teardownView nulling view.source) the rebuilt observer falls back to the main canvas
        expect(system['_tracker'].get(canvasB).observer.canvas).toBe(canvasB);
        expect(system['_tracker'].get(canvasB).observer.canvas).not.toBe(renderer.canvas);

        renderer.destroy();
    });
});
