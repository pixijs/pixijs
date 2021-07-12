const { DisplayObject } = require('@pixi/display');
const { MaskData } = require('@pixi/core');

require('@pixi/canvas-display');

describe('PIXI.DisplayObject', function ()
{
    describe('mask', function ()
    {
        it('should change `renderable` field of maskedObject if we use MaskData', function ()
        {
            const maskedObject = new DisplayObject();
            const maskObject = new DisplayObject();

            maskedObject.mask = new MaskData(maskObject);
            expect(maskObject.renderable).to.be.false;
            maskedObject.mask = null;
            expect(maskObject.renderable).to.be.true;
        });
    });
});
