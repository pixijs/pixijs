const { DisplayObject } = require('@pixi/display');

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
});
