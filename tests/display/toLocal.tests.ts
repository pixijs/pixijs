import { Point } from '../../src/maths/point/Point';
import { Container } from '../../src/scene/container/Container';

describe('toLocal', () =>
{
    it('should return correct local coordinates of a displayObject', () =>
    {
        const parent = new Container();

        const container = new Container();

        parent.addChild(container);

        const point = new Point(100, 100);

        let localPoint = container.toLocal(point);

        expect(localPoint.x).toEqual(100);
        expect(localPoint.y).toEqual(100);

        container.position.x = 20;
        container.position.y = 20;

        container.scale.x = 2;
        container.scale.y = 2;

        localPoint = container.toLocal(point);

        expect(localPoint.x).toEqual(40);
        expect(localPoint.y).toEqual(40);
    });

    it('should map the correct local coordinates of a displayObject to another', () =>
    {
        const parent = new Container();

        const container = new Container();
        const container2 = new Container();

        parent.addChild(container);
        parent.addChild(container2);

        container2.position.x = 100;
        container2.position.y = 100;

        const point = new Point(100, 100);

        container.scale.x = 2;
        container.scale.y = 2;

        const localPoint = container.toLocal(point, container2);

        expect(localPoint.x).toEqual(100);
        expect(localPoint.y).toEqual(100);
    });
});
