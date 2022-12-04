import { MaskData, Transform } from '@pixi/core';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';

import '@pixi/canvas-display';

describe('Container', () =>
{
    describe('addChild', () =>
    {
        it('should recalculate added child correctly', () =>
        {
            const parent = new Container();
            const container = new Container();
            const graphics = new Graphics();

            parent.addChild(container);

            graphics.beginFill();
            graphics.drawRect(0, 0, 10, 10);
            graphics.endFill();
            container.position.set(100, 200);
            container.updateTransform();

            graphics.getBounds();
            // Oops, that can happen sometimes!
            graphics.transform._parentID = container.transform._worldID + 1;

            container.addChild(graphics);

            const bounds = graphics.getBounds();

            expect(bounds.x).toEqual(100);
            expect(bounds.y).toEqual(200);
            expect(bounds.width).toEqual(10);
            expect(bounds.height).toEqual(10);
        });
    });

    describe('removeChild', () =>
    {
        it('should recalculate removed child correctly', () =>
        {
            const parent = new Container();
            const container = new Container();
            const graphics = new Graphics();

            parent.addChild(container);

            graphics.drawRect(0, 0, 10, 10);
            container.position.set(100, 200);
            container.addChild(graphics);
            graphics.getBounds();

            container.removeChild(graphics);

            const bounds = graphics.getBounds();

            expect(bounds.x).toEqual(0);
            expect(bounds.y).toEqual(0);
        });
    });

    describe('width', () =>
    {
        it('should reflect scale', () =>
        {
            const container = new Container();
            const graphics = new Graphics();

            graphics.beginFill();
            graphics.drawRect(0, 0, 10, 10);
            graphics.endFill();
            container.addChild(graphics);
            container.scale.x = 2;

            expect(container.width).toEqual(20);
        });

        it('should adjust scale', () =>
        {
            const container = new Container();
            const graphics = new Graphics();

            graphics.beginFill();
            graphics.drawRect(0, 0, 10, 10);
            graphics.endFill();
            container.addChild(graphics);

            container.width = 20;

            expect(container.width).toEqual(20);
            expect(container.scale.x).toEqual(2);
        });
    });

    describe('height', () =>
    {
        it('should reflect scale', () =>
        {
            const container = new Container();
            const graphics = new Graphics();

            graphics.beginFill();
            graphics.drawRect(0, 0, 10, 10);
            graphics.endFill();
            container.addChild(graphics);
            container.scale.y = 2;

            expect(container.height).toEqual(20);
        });

        it('should adjust scale', () =>
        {
            const container = new Container();
            const graphics = new Graphics();

            graphics.beginFill();
            graphics.drawRect(0, 0, 10, 10);
            graphics.endFill();
            container.addChild(graphics);

            container.height = 20;

            expect(container.height).toEqual(20);
            expect(container.scale.y).toEqual(2);
        });
    });

    describe('calculateBounds', () =>
    {
        function createSquareContainer(x1: number, y1: number, x2: number, y2: number)
        {
            const container = new Container();

            // eslint-disable-next-line func-names
            container['_calculateBounds'] = function ()
            {
                this._bounds.addFrame(Transform.IDENTITY, x1, y1, x2, y2);
            };

            return container;
        }

        it('should take into account mask bounds after mask is set', () =>
        {
            const maskedObject = createSquareContainer(1, 15, 11, 31);
            const parentContainer = new Container();
            let bounds;

            parentContainer.addChild(maskedObject);

            maskedObject.mask = new MaskData(createSquareContainer(5, 10, 35, 29));
            bounds = parentContainer.getBounds();
            expect(bounds.x).toEqual(5);
            expect(bounds.y).toEqual(15);
            expect(bounds.width).toEqual(6);
            expect(bounds.height).toEqual(14);

            maskedObject.mask = createSquareContainer(4, 9, 34, 32);
            bounds = parentContainer.getBounds();
            expect(bounds.x).toEqual(4);
            expect(bounds.y).toEqual(15);
            expect(bounds.width).toEqual(7);
            expect(bounds.height).toEqual(16);
        });
    });
});
