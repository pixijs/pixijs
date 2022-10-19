import { Container } from '@pixi/display';
import '@pixi/canvas-display';

describe('Container', () =>
{
    describe('render', () =>
    {
        it('should not render when object not visible', () =>
        {
            const container = new Container();
            const canvasSpy = jest.spyOn(container, '_renderCanvas');

            container.visible = false;

            container.renderCanvas(undefined);
            expect(canvasSpy).not.toBeCalled();
        });

        it('should not render when alpha is zero', () =>
        {
            const container = new Container();
            const canvasSpy = jest.spyOn(container, '_renderCanvas');

            container.worldAlpha = 0;

            container.renderCanvas(undefined);
            expect(canvasSpy).not.toBeCalled();
        });

        it('should not render when object not renderable', () =>
        {
            const container = new Container();
            const canvasSpy = jest.spyOn(container, '_renderCanvas');

            container.renderable = false;

            container.renderCanvas(undefined);
            expect(canvasSpy).not.toBeCalled();
        });

        it('should render children', () =>
        {
            const container = new Container();
            const child = new Container();
            const canvasSpy = jest.spyOn(child, '_renderCanvas');

            container.addChild(child);

            container.renderCanvas(undefined);
            expect(canvasSpy).toBeCalled();
        });
    });
});
