import { Container } from '../Container';

describe('Container#getGlobalPosition', () =>
{
    it('should exist', () =>
    {
        const obj = new Container();

        expect(obj.getGlobalPosition).toBeDefined();
        expect(obj.getGlobalPosition).toBeInstanceOf(Function);
    });

    it('should return correct global coordinates of a container, without depending on its pivot', () =>
    {
        const parent = new Container();
        const container = new Container();

        parent.addChild(container);

        parent.position.set(100, 100);
        parent.rotation = Math.PI;
        parent.scale.set(2, 2);
        container.position.set(10, -30);
        container.pivot.set(1000, 1000);

        let globalPoint = container.getGlobalPosition();

        expect(globalPoint.x).toEqual(80);
        expect(globalPoint.y).toEqual(160);

        // check but skipUpdate

        parent.position.set(200, 200);
        // not strictly skipUpdate, more like use scene graph values...
        globalPoint = container.getGlobalPosition(globalPoint, true);

        expect(globalPoint.x).toEqual(10); // this is the containers values from above unchanged
        expect(globalPoint.y).toEqual(-30); // this is the containers values from above unchanged
    });
});
