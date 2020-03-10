const { DisplayObject, Container } = require('@pixi/display');
const { Renderer, Filter } = require('@pixi/core');

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
            renderer = new Renderer();
            renderer.filter.push(par, par.filters);
            obj.render(renderer);

            const frame = renderer.renderTexture.sourceFrame;

            expect(obj._cacheData.sprite.width).to.equal(10);
            expect(obj._cacheData.sprite.height).to.equal(11);
            expect(frame.x).to.equal(5);
            expect(frame.y).to.equal(15);
            expect(frame.width).to.equal(10);
            expect(frame.height).to.equal(11);
        }
        finally
        {
            renderer.destroy();
        }
    });
});
