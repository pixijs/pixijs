import { Container } from '../../src/scene/container/Container';

describe('Container', () =>
{
    describe('constructor', () =>
    {
        it('should initialise properties', () =>
        {
            const object = new Container();

            expect(object.alpha).toEqual(1);
            expect(object.rgColor).toEqual(0xffffff);
            expect(object.renderable).toBe(true);
            expect(object.visible).toBe(true);
        });
    });

    describe('setTransform', () =>
    {
        it('should set correct properties', () =>
        {
            const object = new Container();

            object.updateTransform({
                x: 1,
                y: 2,
                scaleX: 3,
                scaleY: 4,
                rotation: 5,
                skewX: 6,
                skewY: 7,
                pivotX: 8,
                pivotY: 9,
            });

            expect(object.position.x).toEqual(1);
            expect(object.position.y).toEqual(2);
            expect(object.scale.x).toEqual(3);
            expect(object.scale.y).toEqual(4);
            expect(object.rotation).toEqual(5);
            expect(object.skew.x).toEqual(6);
            expect(object.skew.y).toEqual(7);
            expect(object.pivot.x).toEqual(8);
            expect(object.pivot.y).toEqual(9);
        });

        it('should convert zero scale to one', () =>
        {
            const object = new Container();

            object.updateTransform({
                scaleX: 0,
                scaleY: 0,
            });

            expect(object.scale.x).toEqual(1);
            expect(object.scale.y).toEqual(1);
        });
    });

    describe('destroy', () =>
    {
        it('should not destroy children by default', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);
            container.destroy();

            expect(container.children.length).toEqual(0);
            expect(container.destroyed).toBe(true);
            expect(child.destroyed).toBe(false);
        });

        it('should allow children destroy with option', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);
            container.destroy({ children: true });

            expect(container.children.length).toEqual(0);
            expect(container.destroyed).toBeTrue();
            expect(child.destroyed).toBeTrue();
        });

        it('should allow children destroy with boolean', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);
            container.destroy(true);

            expect(container.children.length).toEqual(0);
            expect(container.destroyed).toBeTrue();
            expect(child.destroyed).toBeTrue();
        });
    });
});
