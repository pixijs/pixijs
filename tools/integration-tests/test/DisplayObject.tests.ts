import { DisplayObject } from '@pixi/display';
import { MaskData } from '@pixi/core';
import { expect } from 'chai';

import '@pixi/canvas-display';

describe('DisplayObject', () =>
{
    describe('mask', () =>
    {
        it('should change `renderable` field of maskedObject if we use MaskData', () =>
        {
            // @ts-expect-error - Instantiating DisplayObject
            const maskedObject = new DisplayObject();
            // @ts-expect-error - Instantiating DisplayObject
            const maskObject = new DisplayObject();

            maskedObject.mask = new MaskData(maskObject);
            expect(maskObject.renderable).to.be.false;
            maskedObject.mask = null;
            expect(maskObject.renderable).to.be.true;
        });
    });
});
