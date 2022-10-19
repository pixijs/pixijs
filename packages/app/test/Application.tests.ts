import { Application } from '@pixi/app';
import { extensions, ExtensionType } from '@pixi/core';
import { Container } from '@pixi/display';

describe('Application', () =>
{
    it('should generate application', () =>
    {
        expect(Application).toBeInstanceOf(Function);
        const app = new Application();

        expect(app.stage).toBeInstanceOf(Container);
        expect(app.renderer).toBeTruthy();

        app.destroy();

        expect(app.stage).toBeNull();
        expect(app.renderer).toBeNull();
    });

    it('register a new plugin, then destroy it', () =>
    {
        const plugin = {
            init: jest.fn(),
            destroy: jest.fn(),
        };
        const extension = { type: ExtensionType.Application, ref: plugin };

        extensions.add(extension);

        const app = new Application();

        app.destroy();

        expect(plugin.init).toHaveBeenCalledOnce();
        expect(plugin.destroy).toHaveBeenCalledOnce();

        extensions.remove(extension);
    });

    it('should remove canvas when destroyed', () =>
    {
        const app = new Application();
        const view = app.view as HTMLCanvasElement;

        expect(view).toBeInstanceOf(HTMLCanvasElement);
        document.body.appendChild(view);

        expect(document.body.contains(view)).toBe(true);
        app.destroy(true);
        expect(document.body.contains(view)).toBe(false);
    });

    it('should not destroy children by default', () =>
    {
        const app = new Application();
        const stage = app.stage;
        const child = new Container();

        stage.addChild(child);

        app.destroy(true);
        expect(child.transform).not.toBeNull();
    });

    it('should allow children destroy', () =>
    {
        const app = new Application();
        const stage = app.stage;
        const child = new Container();

        stage.addChild(child);

        app.destroy(true, true);
        expect(child.transform).toBeNull();
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

        it('should assign resizeTo', () =>
        {
            const app = new Application({
                resizeTo: div,
            });

            expect(app.resizeTo).toEqual(div);
            expect(app.view.width).toEqual(100);
            expect(app.view.height).toEqual(200);
            app.destroy();
        });

        it('should force multiple immediate resizes', () =>
        {
            const spy = jest.fn();
            const app = new Application({
                resizeTo: div,
            });

            app.renderer.on('resize', spy);

            app.resize();
            app.resize();

            expect(spy).toBeCalledTimes(2);

            app.destroy();
        });

        it('should throttle multiple resizes', (done) =>
        {
            const spy = jest.fn();
            const app = new Application({
                resizeTo: div,
            });

            app.renderer.on('resize', spy);
            app.queueResize();
            app.queueResize();

            setTimeout(() =>
            {
                expect(spy).toBeCalledTimes(1);
                app.destroy();
                done();
            }, 50);
        });

        it('should cancel resize on destroy', (done) =>
        {
            const spy = jest.fn();
            const app = new Application({
                resizeTo: div,
            });

            app.renderer.on('resize', spy);
            app.queueResize();
            app.destroy();

            requestAnimationFrame(() =>
            {
                expect(spy).not.toBeCalled();
                done();
            });
        });

        it('should resize cancel resize queue', (done) =>
        {
            const spy = jest.fn();
            const app = new Application({
                resizeTo: div,
            });

            app.renderer.on('resize', spy);
            app.queueResize();
            app.resize();
            app.destroy();

            requestAnimationFrame(() =>
            {
                expect(spy).toBeCalledTimes(1);
                done();
            });
        });

        it('should resizeTo with resolution', () =>
        {
            const app = new Application({
                resolution: 2,
                resizeTo: div,
            });

            expect(app.view.width).toEqual(200);
            expect(app.view.height).toEqual(400);
            app.destroy();
        });

        it('should resizeTo with resolution and autoDensity', () =>
        {
            const app = new Application({
                resolution: 2,
                resizeTo: div,
                autoDensity: true,
            });

            expect(app.view.width).toEqual(200);
            expect(app.view.height).toEqual(400);
            expect(app.view.style.width).toEqual(div.style.width);
            expect(app.view.style.height).toEqual(div.style.height);
            app.destroy();
        });
    });

    it('should support OffscreenCanvas', () =>
    {
        const view = new OffscreenCanvas(1, 1);
        const app = new Application({ view, width: 1, height: 1 });

        expect(app.view).toBeInstanceOf(OffscreenCanvas);

        app.destroy();
    });
});
