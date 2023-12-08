import { Point } from '../../src/maths/point/Point';
import { Container } from '../../src/scene/container/Container';

describe('toGlobal', () =>
{
    it('should return correct global coordinates of a point from within a displayObject', () =>
    {
        const parent = new Container();

        const container = new Container();

        parent.addChild(container);

        const point = new Point(100, 100);

        let globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toEqual(100);
        expect(globalPoint.y).toEqual(100);

        container.position.x = 20;
        container.position.y = 20;

        container.scale.x = 2;
        container.scale.y = 2;

        globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toEqual(220);
        expect(globalPoint.y).toEqual(220);
    });
});
