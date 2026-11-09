import '~/scene/graphics/init';
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

function getView(renderer: WebGLRenderer, element: EventTarget): EventsViewData
{
    return renderer.events['_views'].get(element);
}

async function setupMultiView(viewBOptions: Record<string, unknown> = {})
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

    renderer.addView({ canvas: canvasB, ...viewBOptions });

    const sceneA = createScene();
    const sceneB = createScene();

    renderer.render({ container: sceneA.stage });
    renderer.render({ container: sceneB.stage, target: canvasB });

    return { renderer, canvasA, canvasB, sceneA, sceneB };
}

describe('Multi-view feature toggle', () =>
{
    it('global move=false stops secondary moves', async () =>
    {
        const { renderer, canvasB, sceneA, sceneB } = await setupMultiView();

        const moveA = jest.fn();
        const moveB = jest.fn();

        sceneA.graphics.on('pointermove', moveA);
        sceneB.graphics.on('pointermove', moveB);

        renderer.events.features.move = false;

        expect(getView(renderer, canvasB).features.move).toBe(false);
        expect(renderer.events['_anyMove']).toBe(false);

        // a hit at view A's local (25, 25) and view B's local (25, 25): neither fires
        document.dispatchEvent(pointerEvent('pointermove', 25, 25));
        document.dispatchEvent(pointerEvent('pointermove', 225, 25));

        expect(moveA).not.toHaveBeenCalled();
        expect(moveB).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('global click=false stops secondary clicks', async () =>
    {
        const { renderer, canvasA, canvasB, sceneA, sceneB } = await setupMultiView();

        const downA = jest.fn();
        const downB = jest.fn();

        sceneA.graphics.on('pointerdown', downA);
        sceneB.graphics.on('pointerdown', downB);

        renderer.events.features.click = false;

        expect(getView(renderer, canvasB).features.click).toBe(false);
        expect(renderer.events['_anyClick']).toBe(false);

        canvasA.dispatchEvent(pointerEvent('pointerdown', 25, 25));
        canvasB.dispatchEvent(pointerEvent('pointerdown', 225, 25));

        expect(downA).not.toHaveBeenCalled();
        expect(downB).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('global wheel=false stops secondary wheel', async () =>
    {
        const { renderer, canvasA, canvasB, sceneA, sceneB } = await setupMultiView();

        const wheelA = jest.fn();
        const wheelB = jest.fn();

        sceneA.graphics.on('wheel', wheelA);
        sceneB.graphics.on('wheel', wheelB);

        renderer.events.features.wheel = false;

        expect(getView(renderer, canvasB).features.wheel).toBe(false);
        expect(renderer.events['_anyWheel']).toBe(false);

        canvasA.dispatchEvent(new WheelEvent('wheel', { clientX: 25, clientY: 25, deltaY: 10, bubbles: true }));
        canvasB.dispatchEvent(new WheelEvent('wheel', { clientX: 225, clientY: 25, deltaY: 10, bubbles: true }));

        expect(wheelA).not.toHaveBeenCalled();
        expect(wheelB).not.toHaveBeenCalled();

        renderer.destroy();
    });

    it('per-view move=false override survives a global move re-enable', async () =>
    {
        const { renderer, canvasB } = await setupMultiView({ eventFeatures: { move: false } });

        const viewB = getView(renderer, canvasB);

        // the per-view override holds even though the renderer-wide default is true
        expect(viewB.features.move).toBe(false);

        renderer.events.features.move = false;
        expect(viewB.features.move).toBe(false);

        // re-enabling the renderer-wide feature must NOT clobber view B's explicit opt-out;
        // the main view follows the live value
        renderer.events.features.move = true;

        expect(viewB.features.move).toBe(false);
        expect(getView(renderer, renderer.canvas).features.move).toBe(true);

        renderer.destroy();
    });

    it('global re-enable restores a non-overriding secondary', async () =>
    {
        const { renderer, canvasB } = await setupMultiView();

        const viewB = getView(renderer, canvasB);

        renderer.events.features.move = false;
        expect(viewB.features.move).toBe(false);
        expect(renderer.events['_anyMove']).toBe(false);

        // view B has no override, so it follows the renderer-wide feature back on
        renderer.events.features.move = true;

        expect(viewB.features.move).toBe(true);
        expect(renderer.events['_anyMove']).toBe(true);

        renderer.destroy();
    });

    it('single-view main toggle still works', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 100,
            height: 100,
        });

        const canvas = renderer.canvas as HTMLCanvasElement;

        canvas.style.cssText = 'position: fixed; left: 0px; top: 0px; width: 100px; height: 100px;';
        document.body.appendChild(canvas);
        attachedCanvases.push(canvas);

        const scene = createScene();

        renderer.render({ container: scene.stage });

        const down = jest.fn();

        scene.graphics.on('pointerdown', down);

        renderer.events.features.click = false;
        expect(renderer.events['_anyClick']).toBe(false);

        canvas.dispatchEvent(pointerEvent('pointerdown', 25, 25));
        expect(down).not.toHaveBeenCalled();

        renderer.events.features.click = true;
        expect(renderer.events['_anyClick']).toBe(true);

        canvas.dispatchEvent(pointerEvent('pointerdown', 25, 25));
        expect(down).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });
});
