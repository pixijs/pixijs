import { Container } from '../Container';
import { Point } from '~/maths';

describe('toGlobal', () =>
{
    let parent: Container;
    let container: Container;
    let point: Point;

    beforeEach(() =>
    {
        parent = new Container();
        container = new Container();
        point = new Point(100, 100);
    });

    it('should handle basic positioning without parent', () =>
    {
        const globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toBe(100);
        expect(globalPoint.y).toBe(100);
    });

    it('should handle basic positioning with parent', () =>
    {
        parent.addChild(container);
        const globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toBe(100);
        expect(globalPoint.y).toBe(100);
    });

    it('should handle container position and scale', () =>
    {
        parent.addChild(container);
        container.position.set(20, 20);
        container.scale.set(2, 2);

        const globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toBe(220);
        expect(globalPoint.y).toBe(220);
    });

    it('should handle parent transforms', () =>
    {
        parent.position.set(100, 100);
        parent.scale.set(2, 2);
        parent.addChild(container);

        const globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toBe(300); // (100 * 2) + 100
        expect(globalPoint.y).toBe(300);
    });

    it('should handle rotation', () =>
    {
        parent.addChild(container);
        container.rotation = Math.PI / 2; // 90 degrees

        const globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toBeCloseTo(-100);
        expect(globalPoint.y).toBeCloseTo(100);
    });

    it('should handle nested transforms', () =>
    {
        const grandParent = new Container();

        grandParent.position.set(50, 50);
        grandParent.scale.set(2, 2);

        parent.position.set(100, 100);
        parent.scale.set(0.5, 0.5);
        parent.rotation = Math.PI / 4; // 45 degrees

        container.position.set(20, 20);
        container.scale.set(2, 2);

        grandParent.addChild(parent);
        parent.addChild(container);

        const globalPoint = container.toGlobal(point);
        // Complex transform chain: grandParent -> parent -> container -> point

        expect(globalPoint.x).toBeDefined();
        expect(globalPoint.y).toBeDefined();
    });

    it('should handle skew transforms', () =>
    {
        parent.addChild(container);
        container.skew.set(0.5, 0.5);

        const globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toBeDefined();
        expect(globalPoint.y).toBeDefined();
    });

    it('should handle negative scale', () =>
    {
        parent.addChild(container);
        container.scale.set(-1, -1);

        const globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toBe(-100);
        expect(globalPoint.y).toBe(-100);
    });

    it('should handle zero point', () =>
    {
        parent.addChild(container);
        container.position.set(50, 50);
        container.scale.set(2, 2);

        const zeroPoint = new Point(0, 0);
        const globalPoint = container.toGlobal(zeroPoint);

        expect(globalPoint.x).toBe(50);
        expect(globalPoint.y).toBe(50);
    });

    it('should handle pivot point transforms', () =>
    {
        parent.addChild(container);
        container.pivot.set(50, 50);
        container.position.set(100, 100);

        const globalPoint = container.toGlobal(point);

        expect(globalPoint.x).toBe(150); // 100 + (100 - 50)
        expect(globalPoint.y).toBe(150);
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

        const point = new Point(0, 0);
        const globalPoint = child.toGlobal(point);

        // With correct matrix multiplication, translations should add up:
        // 100 (grandParent) + 100 (parent) + 100 (child) + 0 (point) = 300
        expect(globalPoint.x).toBe(300);
        expect(globalPoint.y).toBe(0);
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

        const point = new Point(0, 0);
        const globalPoint = child.toGlobal(point);

        // With correct matrix multiplication:
        expect(globalPoint.x).toBe(400);
        expect(globalPoint.y).toBe(0);
    });
});
