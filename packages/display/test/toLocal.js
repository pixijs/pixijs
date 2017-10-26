'use strict';

describe('toLocal', function ()
{
    it('should return correct local cordinates of a displayObject', function ()
    {
        const parent = new PIXI.Container();

        const container = new PIXI.Container();

        parent.addChild(container);

        const point = new PIXI.Point(100, 100);

        let localPoint = container.toLocal(point);

        expect(localPoint.x).to.equal(100);
        expect(localPoint.y).to.equal(100);

        container.position.x = 20;
        container.position.y = 20;

        container.scale.x = 2;
        container.scale.y = 2;

        localPoint = container.toLocal(point);

        expect(localPoint.x).to.equal(40);
        expect(localPoint.y).to.equal(40);
    });

    it('should map the correct local cordinates of a displayObject to another', function ()
    {
        const parent = new PIXI.Container();

        const container = new PIXI.Container();
        const container2 = new PIXI.Container();

        parent.addChild(container);
        parent.addChild(container2);

        container2.position.x = 100;
        container2.position.y = 100;

        const point = new PIXI.Point(100, 100);

        container.scale.x = 2;
        container.scale.y = 2;

        const localPoint = container.toLocal(point, container2);

        expect(localPoint.x).to.equal(100);
        expect(localPoint.y).to.equal(100);
    });
});
