'use strict';

describe('PIXI.interaction.InteractionData', function ()
{
    describe('getLocalPosition', function ()
    {
        it('should populate second parameter with result', function ()
        {
            const data = new PIXI.interaction.InteractionData();
            const stage = new PIXI.DisplayObject();
            const displayObject = new PIXI.DisplayObject();
            const point = new PIXI.Point();

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
