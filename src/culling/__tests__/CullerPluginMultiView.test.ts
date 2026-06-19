import { Culler } from '../Culler';
import { CullerPlugin } from '../CullerPlugin';
import { getApp } from '@test-utils';
import { extensions } from '~/extensions';
import { Graphics } from '~/scene';

function attachedCanvas(width = 100, height = 100): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    return canvas;
}

describe('CullerPlugin multiView', () =>
{
    beforeEach(() =>
    {
        Culler.shared = new Culler();
        extensions.add(CullerPlugin);
    });

    afterEach(() =>
    {
        extensions.remove(CullerPlugin);
    });

    it('culls the single primary view, renders once, and ends on the primary stage', async () =>
    {
        // updateTransform:true makes the culler refresh world transforms during cull, so freshly
        // positioned objects are culled on the very first render
        const app = await getApp({ width: 100, height: 100, culler: { updateTransform: true } });

        const offScreen = app.stage.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        offScreen.cullable = true;
        offScreen.x = 200;
        offScreen.y = 200;

        const onScreen = app.stage.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        onScreen.cullable = true;
        onScreen.x = 10;
        onScreen.y = 10;

        const spy = jest.spyOn(app.renderer, 'render');

        app.render();

        expect(offScreen.culled).toBe(true);
        expect(onScreen.culled).toBe(false);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(app.renderer.lastObjectRendered).toBe(app.stage);

        app.destroy();
    });

    it('culls each enabled view against its own viewport and ends on the primary stage', async () =>
    {
        const app = await getApp({ multiView: true, width: 100, height: 100, culler: { updateTransform: true } });
        const canvasB = attachedCanvas(100, 100);
        const view = app.addView({ canvas: canvasB });

        const inside = view.stage.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        inside.cullable = true;
        inside.x = 10;
        inside.y = 10;

        const outside = view.stage.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        outside.cullable = true;
        outside.x = 200;
        outside.y = 200;

        const spy = jest.spyOn(app.renderer, 'render');

        app.render();

        expect(inside.culled).toBe(false);
        expect(outside.culled).toBe(true);
        // primary + secondary each render once
        expect(spy).toHaveBeenCalledTimes(2);
        expect(app.renderer.lastObjectRendered).toBe(app.stage);

        app.destroy(true, true);
        canvasB.remove();
    });

    it('skips a disabled secondary view when culling and rendering', async () =>
    {
        const app = await getApp({ multiView: true, width: 100, height: 100 });
        const canvasB = attachedCanvas(100, 100);
        const view = app.addView({ canvas: canvasB });

        view.enabled = false;

        const child = view.stage.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        child.cullable = true;
        child.x = 200;
        child.y = 200;

        const spy = jest.spyOn(app.renderer, 'render');
        const cullSpy = jest.spyOn(Culler.shared, 'cull');

        app.render();

        // only the primary view renders, and the disabled view's stage is never culled
        expect(spy).toHaveBeenCalledTimes(1);
        expect(cullSpy).toHaveBeenCalledTimes(1);
        expect(cullSpy).toHaveBeenCalledWith(app.stage, app.renderer.screen, true);
        expect(child.culled).toBe(false);

        app.destroy(true, true);
        canvasB.remove();
    });
});
