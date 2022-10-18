import { DisplayObject, Container } from '@pixi/display';
import { Rectangle, Renderer, Filter } from '@pixi/core';

import '@pixi/mixin-cache-as-bitmap';

describe('DisplayObject#cacheAsBitmap', () =>
{
    it('should contain property', () =>
    {
        // @ts-expect-error - instantiating DisplayObject
        const obj = new DisplayObject();

        expect(obj.cacheAsBitmap).toBeDefined();
        expect(obj.cacheAsBitmap).toBeBoolean();
        expect(obj.cacheAsBitmap).toBe(false);
    });

    it('should enable cacheAsBitmap', () =>
    {
        // @ts-expect-error - instantiating DisplayObject
        const obj = new DisplayObject();

        obj.cacheAsBitmap = true;
    });

    it('should respect filters', () =>
    {
        const par = new Container();
        const obj = new Container();
        let renderer = null;

        par.filters = [new Filter()];
        par.addChild(obj);

        obj.position.set(5, 15);
        obj.updateTransform();
        obj.cacheAsBitmap = true;
        // eslint-disable-next-line func-names
        obj['_calculateBounds'] = function ()
        {
            this._bounds.clear();
            this._bounds.addFrame(this.transform, 0, 0, 10, 11);
        };

        try
        {
            renderer = new Renderer({ width: 50, height: 50 });
            renderer.filter.push(par, par.filters);

            const srcExpected = new Rectangle(5, 15, 10, 11);
            const destExpected = new Rectangle(0, 0, 10, 11);

            let src = renderer.renderTexture.sourceFrame;
            let dest = renderer.renderTexture.destinationFrame;

            expect(src.toString()).toEqual(srcExpected.toString());
            expect(dest.toString()).toEqual(destExpected.toString());

            obj.render(renderer);

            src = renderer.renderTexture.sourceFrame;
            dest = renderer.renderTexture.destinationFrame;

            expect(obj._cacheData.sprite.width).toEqual(10);
            expect(obj._cacheData.sprite.height).toEqual(11);
            expect(src.toString()).toEqual(srcExpected.toString());
            expect(dest.toString()).toEqual(destExpected.toString());
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should not throw error when filters is empty array', () =>
    {
        const obj = new Container();

        obj.filters = [];
        obj.cacheAsBitmap = true;

        expect(() =>
        {
            let renderer = null;

            try
            {
                renderer = new Renderer({ width: 50, height: 50 });

                obj.render(renderer);
            }
            finally
            {
                renderer.destroy();
            }
        }).not.toThrowError();
    });

    it('should respect projection', () =>
    {
        const par = new Container();
        const obj = new Container();
        let renderer = null;

        par.filters = [new Filter()];
        par.addChild(obj);

        obj.position.set(5, 15);
        obj.updateTransform();
        obj.cacheAsBitmap = true;
        // eslint-disable-next-line func-names
        obj['_calculateBounds'] = function ()
        {
            this._bounds.clear();
            this._bounds.addFrame(this.transform, 0, 0, 10, 11);
        };

        try
        {
            const srcExpected = new Rectangle(5, 15, 10, 11);
            const destExpected = new Rectangle(20, 20, 10, 11);

            renderer = new Renderer({ width: 50, height: 50 });
            renderer.renderTexture.bind(null, srcExpected, destExpected);

            obj.render(renderer);

            const src = renderer.renderTexture.sourceFrame;
            const dest = renderer.renderTexture.destinationFrame;

            expect(obj._cacheData.sprite.width).toEqual(10);
            expect(obj._cacheData.sprite.height).toEqual(11);
            expect(src.toString()).toEqual(srcExpected.toString());
            expect(dest.toString()).toEqual(destExpected.toString());
        }
        finally
        {
            renderer.destroy();
        }
    });
});
