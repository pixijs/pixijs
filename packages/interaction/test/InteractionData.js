const { InteractionData } = require('../');
const { DisplayObject } = require('@pixi/display');
const { Point } = require('@pixi/math');

require('@pixi/canvas-display');

describe('PIXI.interaction.InteractionData', function ()
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
