import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Sprite } from '@pixi/sprite';
import '@pixi/canvas-display';

describe('CanvasMaskManager', () =>
{
    it('should work on all graphics masks inside container', () =>
    {
        const renderer = new CanvasRenderer({ width: 1, height: 1 });
        const shapeSpy = jest.spyOn(renderer.maskManager, 'renderGraphicsShape');
        const contextPath = jest.spyOn(renderer.canvasContext.activeContext, 'closePath');
        const cont = new Container();

        cont.mask = new Sprite();
        expect(() => { renderer.render(cont); }).not.toThrowError();
        expect(shapeSpy).not.toBeCalled();

        const graphics1 = new Graphics();
        const graphics2 = new Graphics();

        graphics1.beginFill(0xffffff, 1.0);
        graphics1.drawRect(0, 0, 100, 100);
        graphics2.beginFill(0xffffff, 1.0);
        graphics2.drawRect(150, 150, 100, 100);

        cont.mask = new Container();
        cont.mask.addChild(graphics1, graphics2);
        cont.addChild(cont.mask);

        expect(() => { renderer.render(cont); }).not.toThrowError();
        expect(shapeSpy).toBeCalledTimes(2);
        expect(contextPath).toBeCalledTimes(2);
        cont.mask.removeChildren();
        cont.mask = graphics1;
        expect(() => { renderer.render(cont); }).not.toThrowError();
        expect(shapeSpy).toBeCalledTimes(3);
        expect(contextPath).toBeCalledTimes(3);
    });

    it('should set correct transform for graphics', () =>
    {
        const renderer = new CanvasRenderer({ width: 1, height: 1 });
        const transformSpy = jest.spyOn(renderer.canvasContext.activeContext, 'setTransform');
        const cont = new Container();
        const graphics1 = new Graphics();
        const graphics2 = new Graphics();

        graphics1.beginFill(0xffffff, 1.0);
        graphics1.drawRect(0, 0, 100, 100);
        graphics2.beginFill(0xffffff, 1.0);
        graphics2.drawRect(0, 0, 100, 100);

        graphics1.scale.set(2.0);
        graphics2.scale.set(3.0);

        cont.mask = new Container();
        cont.mask.addChild(graphics1, graphics2);
        cont.addChild(cont.mask);

        expect(() => { renderer.render(cont); }).not.toThrowError();
        expect(transformSpy).toBeCalledTimes(3);
        expect(transformSpy.mock.calls[1][0]).toEqual(2);
        expect(transformSpy.mock.calls[2][0]).toEqual(3);
    });
});
