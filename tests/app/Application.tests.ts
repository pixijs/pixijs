import { Application } from '../../src/app/Application';
import { extensions, ExtensionType } from '../../src/extensions/Extensions';
import { Container } from '../../src/scene/container/Container';

import type { ApplicationOptions } from '../../src/app/Application';

describe('Application', () =>
{
    const setup = async (options?: Partial<ApplicationOptions>) =>
    {
        const app = new Application();

        await app.init(options);

        return app;
    };

    it('should generate application', async () =>
    {
        expect(Application).toBeInstanceOf(Function);
        const app = await setup();

        expect(app.stage).toBeInstanceOf(Container);
        expect(app.renderer).toBeTruthy();

        app.destroy();

        expect(app.stage).toBeNull();
        expect(app.renderer).toBeNull();
    });

    it('register a new plugin, then destroy it', async () =>
    {
        const plugin = {
            init: jest.fn(),
            destroy: jest.fn(),
        };
        const extension = { type: ExtensionType.Application, ref: plugin };

        extensions.add(extension);

        const app = await setup();

        app.destroy();

        expect(plugin.init).toHaveBeenCalledOnce();
        expect(plugin.destroy).toHaveBeenCalledOnce();

        extensions.remove(extension);
    });

    it('should remove canvas when destroyed', async () =>
    {
        const app = await setup();
        const view = app.canvas as HTMLCanvasElement;

        expect(view).toBeInstanceOf(HTMLCanvasElement);
        document.body.appendChild(view);

        expect(document.body.contains(view)).toBe(true);
        app.destroy(true);
        expect(document.body.contains(view)).toBe(false);
    });

    it('should not destroy children by default', async () =>
    {
        const app = await setup();
        const stage = app.stage;
        const child = new Container();

        stage.addChild(child);

        app.destroy();
        expect(child.destroyed).toBeFalse();
    });

    it('should destroy children when option passed', async () =>
    {
        const app = await setup();
        const stage = app.stage;
        const child = new Container();

        stage.addChild(child);

        app.destroy(true);
        expect(child.destroyed).toBeTrue();
    });

    describe('resizeTo', () =>
    {
        let div: HTMLDivElement;

        beforeAll(() =>
        {
            div = document.createElement('div');

            div.style.width = '100px';
            div.style.height = '200px';
            document.body.appendChild(div);
        });

        afterAll(() =>
        {
            div.parentNode.removeChild(div);
            div = null;
        });

        it('should assign resizeTo', async () =>
        {
            const app = await setup({
                resizeTo: div,
            });

            expect(app.resizeTo).toEqual(div);
            expect(app.canvas.width).toEqual(100);
            expect(app.canvas.height).toEqual(200);
            app.destroy();
        });

        it.skip('should force multiple immediate resizes', async () =>
        {
            const spy = jest.fn();
            const app = await setup({
                resizeTo: div,
            });

            app.renderer.view.texture.source.on('resize', spy);

            app.resize();
            app.resize();

            expect(spy).toBeCalledTimes(2);

            app.destroy();
        });

        it.skip('should throttle multiple resizes', async (done) =>
        {
            const spy = jest.fn();
            const app = await setup({
                resizeTo: div,
            });

            app.renderer.view.texture.source.on('resize', spy);
            app.queueResize();
            app.queueResize();

            setTimeout(() =>
            {
                expect(spy).toBeCalledTimes(1);
                app.destroy();
                done();
            }, 50);
        });

        it.skip('should cancel resize on destroy', async (done) =>
        {
            const spy = jest.fn();
            const app = await setup({
                resizeTo: div,
            });

            // app.renderer.on('resize', spy);
            app.queueResize();
            app.destroy();

            requestAnimationFrame(() =>
            {
                expect(spy).not.toBeCalled();
                done();
            });
        });

        it.skip('should resize cancel resize queue', async (done) =>
        {
            const spy = jest.fn();
            const app = await setup({
                resizeTo: div,
            });

            // app.renderer.screen.on('resize', spy);
            app.queueResize();
            app.resize();
            app.destroy();

            requestAnimationFrame(() =>
            {
                expect(spy).toBeCalledTimes(1);
                done();
            });
        });

        it('should resizeTo with resolution', async () =>
        {
            const app = await setup({
                resolution: 2,
                resizeTo: div,
            });

            expect(app.canvas.width).toEqual(200);
            expect(app.canvas.height).toEqual(400);
            app.destroy();
        });

        it('should resizeTo with resolution and autoDensity', async () =>
        {
            const app = await setup({
                resolution: 2,
                resizeTo: div,
                autoDensity: true,
            });

            expect(app.canvas.width).toEqual(200);
            expect(app.canvas.height).toEqual(400);
            expect(app.canvas.style.width).toEqual(div.style.width);
            expect(app.canvas.style.height).toEqual(div.style.height);
            app.destroy();
        });
    });

    it('should support OffscreenCanvas', async () =>
    {
        const view = new OffscreenCanvas(1, 1);
        const app = await setup({
            canvas: view,
            width: 1,
            height: 1,
        });

        expect(app.canvas).toBeInstanceOf(OffscreenCanvas);

        app.destroy();
    });
});
