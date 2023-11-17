import { DEG_TO_RAD, RAD_TO_DEG } from '../../src/maths/misc/const';
import { Container } from '../../src/scene/container/Container';
import { updateLayerGroupTransforms } from '../../src/scene/container/utils/updateLayerGroupTransforms';

describe('Container', () =>
{
    describe('constructor', () =>
    {
        it('should initialise properties', () =>
        {
            const object = new Container();

            expect(object.alpha).toEqual(1);
            expect(object.layerColor).toEqual(0xffffffff);
            expect(object.renderable).toBe(true);
            expect(object.visible).toBe(true);
        });
    });

    describe('removeFromParent', () =>
    {
        it('should remove from parent', () =>
        {
            const child = new Container();
            const container = new Container();

            expect(container.children.length).toEqual(0);
            expect(child.parent).toBeNull();

            container.addChild(child);

            expect(container.children.length).toEqual(1);
            expect(child.parent).toEqual(container);

            child.removeFromParent();

            expect(container.children.length).toEqual(0);
            expect(child.parent).toBeNull();
        });

        it('should do nothing if no parent', () =>
        {
            const child = new Container();

            expect(child.parent).toBeNull();

            child.removeFromParent();

            expect(child.parent).toBeNull();
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

    describe('Layer Cascading Visibility', () =>
    {
        it('should traverse parents', () =>
        {
            const rootContainer = new Container({ layer: true });
            const parent = new Container();
            const child = new Container();

            rootContainer.addChild(parent);
            parent.addChild(child);

            expect(child.layerVisibleRenderable).toBe(0b11);
            expect(child.localVisibleRenderable).toBe(0b11);

            parent.visible = false;

            updateLayerGroupTransforms(rootContainer.layerGroup, true);

            expect(child.layerVisibleRenderable).toBe(0b01);
            expect(child.localVisibleRenderable).toBe(0b11);
        });
    });

    describe('rotation', () =>
    {
        it('rotation and angle are different units of the same transformation', () =>
        {
            const object = new Container();

            expect(object.rotation).toEqual(0);
            expect(object.angle).toEqual(0);

            object.rotation = 2;

            expect(object.rotation).toEqual(2);
            expect(object.angle).toEqual(2 * RAD_TO_DEG);

            object.angle = 180;

            expect(object.rotation).toEqual(180 * DEG_TO_RAD);
            expect(object.angle).toEqual(180);
        });
    });

    describe('mask', () =>
    {
        // todo: ticket: https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=44913565
        it.skip('should set isMask and renderable properties correctly even if the same mask is used by multiple objects',
            () =>
            {
                const mask1 = new Container();
                const mask2 = new Container();
                const container1 = new Container();
                const container2 = new Container();

                expect(mask1.includeInBuild).toBe(true);
                expect(mask1.measurable).toBe(true);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(true);

                container1.mask = mask1;

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(false);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(true);

                container1.mask = mask1;

                expect(mask1.includeInBuild).toBe(true);
                expect(mask1.measurable).toBe(false);
                expect(mask2.includeInBuild).toBe(false);
                expect(mask2.measurable).toBe(true);

                container2.mask = mask1;

                expect(mask1.includeInBuild).toBe(true);
                expect(mask2.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(false);
                expect(mask2.measurable).toBe(true);

                container1.mask = mask2;

                expect(mask1.includeInBuild).toBe(true);
                expect(mask1.measurable).toBe(false);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(false);

                container2.mask = mask2;

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(true);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(false);

                container1.mask = null;

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(true);
                expect(mask2.includeInBuild).toBe(true);
                expect(mask2.measurable).toBe(false);

                container2.mask = null;

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(true);
                expect(mask2.includeInBuild).toBe(false);
                expect(mask2.measurable).toBe(true);

                container1.mask = mask1;

                expect(mask1.includeInBuild).toBe(true);
                expect(mask1.measurable).toBe(false);

                container1.destroy();

                expect(mask1.includeInBuild).toBe(false);
                expect(mask1.measurable).toBe(true);
            }
        );
    });

    describe('remove', () =>
    {
        it('should trigger removed listeners', () =>
        {
            const listener = jest.fn();
            const child = new Container();
            const container = new Container();

            child.on('removed', listener);

            container.addChild(child);
            container.removeChild(child);

            expect(listener).toBeCalledTimes(1);

            container.addChild(child);
            child.removeFromParent();

            expect(listener).toBeCalledTimes(2);

            container.addChild(child);
            child.destroy();

            expect(listener).toBeCalledTimes(3);
        });
    });

    describe('destroy', () =>
    {
        it('should trigger destroyed listeners', () =>
        {
            const listener = jest.fn();
            const child = new Container();
            const container = new Container();

            child.on('destroyed', listener);

            container.addChild(child);
            container.removeChild(child);

            expect(listener).not.toBeCalled();

            container.addChild(child);
            child.destroy();

            expect(listener).toBeCalledTimes(1);
        });

        it('should trigger destroyed listeners once destruction is complete', () =>
        {
            let listenerCallCount = 0;
            const child = new Container();
            const container = new Container();

            child.on('destroyed', () =>
            {
                listenerCallCount++;
                expect(child.destroyed).toBe(true);
                expect(child.parent).toBeNull();
            });

            container.addChild(child);
            container.removeChild(child);

            expect(listenerCallCount).toEqual(0);

            container.addChild(child);
            child.destroy();

            expect(listenerCallCount).toEqual(1);
        });
    });

    describe('alpha', () =>
    {
        it('should traverse alpha', () =>
        {
            const rootContainer = new Container({ layer: true });
            const parent = new Container();
            const child = new Container();

            rootContainer.addChild(parent);
            parent.addChild(child);

            parent.alpha = 0.5;

            updateLayerGroupTransforms(rootContainer.layerGroup, true);

            const alpha = ((child.layerColor >> 24) & 0xFF) / 255;

            expect(alpha).toBeCloseTo(0.5, 2);
        });
    });
});
