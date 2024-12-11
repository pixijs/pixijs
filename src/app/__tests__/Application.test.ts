import { Application } from '../Application';
import { getApp, nextTick } from '@test-utils';
import { extensions, ExtensionType } from '~/extensions';
import { Container } from '~/scene';

import type { ApplicationOptions } from '../Application';

describe('Application', () =>
{
    describe('LifeCycle', () =>
    {
        it('should generate application', async () =>
        {
            expect(Application).toBeInstanceOf(Function);
            const app = await getApp();

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

            const app = await getApp();

            app.destroy();

            expect(plugin.init).toHaveBeenCalledOnce();
            expect(plugin.destroy).toHaveBeenCalledOnce();

            extensions.remove(extension);
        });

        it('should remove canvas when destroyed', async () =>
        {
            const app = await getApp();
            const view = app.canvas as HTMLCanvasElement;

            expect(view).toBeInstanceOf(HTMLCanvasElement);
            document.body.appendChild(view);

            expect(document.body.contains(view)).toBe(true);
            app.destroy(true);
            expect(document.body.contains(view)).toBe(false);
        });

        it('should not destroy children by default', async () =>
        {
            const app = await getApp();
            const stage = app.stage;
            const child = new Container();

            stage.addChild(child);

            app.destroy();
            expect(child.destroyed).toBeFalse();
        });

        it('should destroy children when option passed', async () =>
        {
            const app = await getApp();
            const stage = app.stage;
            const child = new Container();

            stage.addChild(child);

            app.destroy(true, true);
            expect(child.destroyed).toBeTrue();
        });
    });

    describe('resizeTo', () =>
    {
        const getAppWithDiv = async (options?: Partial<ApplicationOptions>) =>
        {
            const div: HTMLDivElement = document.createElement('div');

            div.style.width = '100px';
            div.style.height = '200px';
            document.body.appendChild(div);

            const app = await getApp({
                resizeTo: div,
                ...options,
            });

            const forceResizeApp = (width: number, height: number, queue = false) =>
            {
                div.style.width = `${width}px`;
                div.style.height = `${height}px`;

                if (queue)
                {
                    app.queueResize();
                }
                else
                {
                    app.resize();
                }
            };

            const forceQueueResizeApp = (width: number, height: number) => forceResizeApp(width, height, true);

            const cleanup = (destroy = true) =>
            {
                destroy && app.destroy();
                div.parentNode.removeChild(div);
            };

            return {
                app,
                div,
                forceResizeApp,
                forceQueueResizeApp,
                cleanup,
            };
        };

        it('should assign resizeTo', async () =>
        {
            const { app, div, cleanup } = await getAppWithDiv();

            expect(app.resizeTo).toEqual(div);
            expect(app.canvas.width).toEqual(100);
            expect(app.canvas.height).toEqual(200);

            cleanup();
        });

        it('should force multiple immediate resizes', async () =>
        {
            const spy = jest.fn();
            const { app, forceResizeApp, cleanup } = await getAppWithDiv();

            app.renderer.view.texture.source.on('resize', spy);

            forceResizeApp(200, 400);
            forceResizeApp(300, 500);

            expect(spy).toHaveBeenCalledTimes(2);

            cleanup();
        });

        // eslint-disable-next-line jest/no-done-callback
        it('should throttle multiple resizes', async (done) =>
        {
            const { app, forceQueueResizeApp, cleanup } = await getAppWithDiv();

            const onResize = () =>
            {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                nextTick().then(() =>
                {
                    // give the canvas a chance to be resized before we check it
                    expect(app.canvas.width).toEqual(300);
                    expect(app.canvas.height).toEqual(500);

                    cleanup();
                    done();
                });
            };

            app.renderer.view.texture.source.on('resize', onResize);
            forceQueueResizeApp(200, 400);
            forceQueueResizeApp(300, 500);
        });

        // eslint-disable-next-line jest/no-done-callback
        it('should cancel resize on destroy', async (done) =>
        {
            const spy = jest.fn();
            const { app, forceQueueResizeApp, cleanup } = await getAppWithDiv();

            app.renderer.view.texture.source.on('resize', spy);
            forceQueueResizeApp(200, 400);
            app.destroy();

            requestAnimationFrame(() =>
            {
                expect(spy).not.toHaveBeenCalled();
                cleanup(false); // don't destroy, we already did
                done();
            });
        });

        // eslint-disable-next-line jest/no-done-callback
        it('should resize cancel resize queue', async (done) =>
        {
            const spy = jest.fn();
            const { app, forceQueueResizeApp, forceResizeApp, cleanup } = await getAppWithDiv();

            app.renderer.view.texture.source.on('resize', spy);
            forceQueueResizeApp(200, 400);
            forceResizeApp(300, 500);
            app.destroy();

            requestAnimationFrame(() =>
            {
                expect(spy).toHaveBeenCalledTimes(1);
                cleanup(false); // don't destroy, we already did
                done();
            });
        });

        it('should resizeTo with resolution', async () =>
        {
            const { app, cleanup } = await getAppWithDiv({ resolution: 2 });

            expect(app.canvas.width).toEqual(200);
            expect(app.canvas.height).toEqual(400);

            cleanup();
        });

        it('should resizeTo with resolution and autoDensity', async () =>
        {
            const { app, div, cleanup } = await getAppWithDiv({
                resolution: 2,
                autoDensity: true,
            });

            expect(app.canvas.width).toEqual(200);
            expect(app.canvas.height).toEqual(400);
            expect(app.canvas.style.width).toEqual(div.style.width);
            expect(app.canvas.style.height).toEqual(div.style.height);

            cleanup();
        });
    });

    describe('Offscreen Canvas', () =>
    {
        it('should support OffscreenCanvas', async () =>
        {
            const view = new OffscreenCanvas(1, 1);
            const app = await getApp({
                canvas: view,
                width: 1,
                height: 1,
            });

            expect(app.canvas).toBeInstanceOf(OffscreenCanvas);

            app.destroy();
        });
    });
});
