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

describe('AccessibilitySystem multiView events:false', () =>
{
    it('does not dispatch accessible-div events to the main scene when owning view has events:false', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, width: 128, height: 128 });
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const canvasB = attachedCanvas();

        // events opted out, accessibility still defaults true
        renderer.addView({ canvas: canvasB, events: false });

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

        // accessibility still participates: the opted-out canvas gets its own overlay div
        expect(childB._accessibleDiv).toBeTruthy();
        expect(childB._accessibleDiv.parentNode).toBe(system['_tracker'].get(canvasB).div);

        const events = renderer.events;
        // events:false means canvasB is never registered with the EventSystem, so it falls back to
        // the main rootBoundary; capture the main boundary's root before dispatching
        const mainBoundary = events.boundaryForElement(renderer.canvas);

        expect(mainBoundary).toBe(events.rootBoundary);

        const mainRootBefore = mainBoundary.rootTarget;
        const dispatchSpy = jest.spyOn(mainBoundary, 'dispatchEvent');

        childB._accessibleDiv.dispatchEvent(new MouseEvent('click'));

        // the interaction is dropped: no dispatch into the main scene, no boundary repoint
        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(mainBoundary.rootTarget).toBe(mainRootBefore);
        expect(mainBoundary.rootTarget).not.toBe(stageB);

        dispatchSpy.mockRestore();
        renderer.destroy();
    });

    it('still dispatches normally for an events:true secondary view', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true, width: 128, height: 128 });
        const mainCanvas = renderer.canvas as HTMLCanvasElement;

        document.body.appendChild(mainCanvas);
        attachedCanvases.push(mainCanvas);

        const canvasB = attachedCanvas();

        // default participation: events:true
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

        const events = renderer.events;
        const boundaryB = events.boundaryForElement(canvasB);

        // the secondary view gets its own boundary, distinct from the root
        expect(boundaryB).not.toBe(events.rootBoundary);

        const dispatchSpy = jest.spyOn(boundaryB, 'dispatchEvent');

        childB._accessibleDiv.dispatchEvent(new MouseEvent('click'));

        expect(dispatchSpy).toHaveBeenCalled();
        expect(boundaryB.rootTarget).toBe(stageB);

        dispatchSpy.mockRestore();
        renderer.destroy();
    });

    it('main canvas accessible divs still dispatch', async () =>
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

        expect(child._accessibleDiv).toBeTruthy();
        expect(child._accessibleDiv.parentNode).toBe(system.div);

        const events = renderer.events;
        const dispatchSpy = jest.spyOn(events.rootBoundary, 'dispatchEvent');

        child._accessibleDiv.dispatchEvent(new MouseEvent('click'));

        // the null/main path is preserved: a main accessible child still dispatches
        expect(dispatchSpy).toHaveBeenCalled();
        expect(events.rootBoundary.rootTarget).toBe(stage);

        dispatchSpy.mockRestore();
        renderer.destroy();
    });
});
