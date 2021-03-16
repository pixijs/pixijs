const { DisplayObject, Container } = require('@pixi/display');
const { Renderer, Filter } = require('@pixi/core');
const { Rectangle } = require('@pixi/math');

require('../');

describe('PIXI.DisplayObject#cacheAsBitmap', function ()
{
    it('should contain property', function ()
    {
        const obj = new DisplayObject();

        expect(obj.cacheAsBitmap).to.be.not.undefined;
        expect(obj.cacheAsBitmap).to.be.boolean;
        expect(obj.cacheAsBitmap).to.be.false;
    });

    it('should enable cacheAsBitmap', function ()
    {
        const obj = new DisplayObject();

        obj.cacheAsBitmap = true;
    });

    it('should respect filters', function ()
    {
        const par = new Container();
        const obj = new Container();
        let renderer = null;

        par.filters = [new Filter()];
        par.addChild(obj);

        obj.position.set(5, 15);
        obj.updateTransform();
        obj.cacheAsBitmap = true;
        obj._calculateBounds = function ()
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

            expect(src.toString()).to.equal(srcExpected.toString());
            expect(dest.toString()).to.equal(destExpected.toString());

            obj.render(renderer);

            src = renderer.renderTexture.sourceFrame;
            dest = renderer.renderTexture.destinationFrame;

            expect(obj._cacheData.sprite.width).to.equal(10);
            expect(obj._cacheData.sprite.height).to.equal(11);
            expect(src.toString()).to.equal(srcExpected.toString());
            expect(dest.toString()).to.equal(destExpected.toString());
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should respect projection', function ()
    {
        const par = new Container();
        const obj = new Container();
        let renderer = null;

        par.filters = [new Filter()];
        par.addChild(obj);

        obj.position.set(5, 15);
        obj.updateTransform();
        obj.cacheAsBitmap = true;
        obj._calculateBounds = function ()
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

            expect(obj._cacheData.sprite.width).to.equal(10);
            expect(obj._cacheData.sprite.height).to.equal(11);
            expect(src.toString()).to.equal(srcExpected.toString());
            expect(dest.toString()).to.equal(destExpected.toString());
        }
        finally
        {
            renderer.destroy();
        }
    });
});
