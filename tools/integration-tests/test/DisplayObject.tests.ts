import { DisplayObject } from '@pixi/display';
import { MaskData } from '@pixi/core';
import { expect } from 'chai';

import '@pixi/canvas-display';

describe('DisplayObject', function ()
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
