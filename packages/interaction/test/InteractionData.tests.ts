import { InteractionData } from '@pixi/interaction';
import { DisplayObject } from '@pixi/display';
import { Point } from '@pixi/math';
import { expect } from 'chai';

import '@pixi/canvas-display';

describe('InteractionData', function ()
{
    describe('getLocalPosition', function ()
    {
        it('should populate second parameter with result', function ()
        {
            const data = new InteractionData();
            const stage = new DisplayObject();
            const displayObject = new DisplayObject();
            const point = new Point();

            data.global.set(10, 10);
            displayObject.position.set(5, 3);
            displayObject.parent = stage;
            displayObject.displayObjectUpdateTransform();
            data.getLocalPosition(displayObject, point);
            expect(point.x).to.equal(5);
            expect(point.y).to.equal(7);
        });
    });
});
