import { Container } from '../Container';
import { Point } from '~/maths';

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

    it('should handle nested translations correctly', () =>
    {
        const grandParent = new Container();
        const parent = new Container();
        const child = new Container();

        // Set up hierarchy
        grandParent.addChild(parent);
        parent.addChild(child);

        // Set up transforms
        grandParent.position.set(100, 0);
        parent.position.set(100, 0);
        child.position.set(100, 0);

        const globalPoint = new Point(300, 0);
        const localPoint = child.toLocal(globalPoint);

        // With correct matrix multiplication, translations should subtract:
        // 300 (global) - 100 (grandParent) - 100 (parent) - 100 (child) = 0
        expect(localPoint.x).toBe(0);
        expect(localPoint.y).toBe(0);
    });

    it('should handle nested translations with scale correctly', () =>
    {
        const grandParent = new Container();
        const parent = new Container();
        const child = new Container();

        // Set up hierarchy
        grandParent.addChild(parent);
        parent.addChild(child);

        // Set up transforms
        grandParent.position.set(100, 0);
        grandParent.scale.set(2, 2);

        parent.position.set(100, 0);

        child.position.set(50, 0);

        const globalPoint = new Point(400, 0);
        const localPoint = child.toLocal(globalPoint);

        // With correct matrix multiplication:
        // Converting from 400 global should result in local point at 0,0
        expect(localPoint.x).toBe(0);
        expect(localPoint.y).toBe(0);
    });
});
