import { DEG_TO_RAD, RAD_TO_DEG } from '../../src/maths/misc/const';
import { Container } from '../../src/scene/container/Container';

describe('Container', () =>
{
    describe('constructor', () =>
    {
        it('should initialise properties', () =>
        {
            const object = new Container();

            expect(object.alpha).toEqual(1);
            // expect(object.worldAlpha).toEqual(1);
            expect(object.renderable).toBe(true);
            expect(object.visible).toBe(true);
        });
    });

    describe('setParent', () =>
    {
        // note: setParent does not exist, adding children tested in Container.tests.ts
        // it.skip('should add itself to a Container', () =>
        // {
        //     const child = new Container();
        //     const container = new Container();

        //     expect(container.children.length).toEqual(0);
        //     child.setParent(container);
        //     expect(container.children.length).toEqual(1);
        //     expect(child.parent).toEqual(container);
        // });

        // it.skip('should throw if not Container', () =>
        // {
        //     const child = new Container();
        //     const notAContainer = {};

        //     expect(() => child.setParent()).toThrowError('setParent: Argument must be a Container');
        //     expect(() => child.setParent(notAContainer)).toThrowError('setParent: Argument must be a Container');
        // });
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
        // note: setTransform does not exist. worldTransform or localTransform doesn't work either?
        // it.skip('should set correct properties', () =>
        // {
        //     const object = new Container();

        //     object.setTransform(1, 2, 3, 4, 5, 6, 7, 8, 9);

        //     expect(object.position.x).toEqual(1);
        //     expect(object.position.y).toEqual(2);
        //     expect(object.scale.x).toEqual(3);
        //     expect(object.scale.y).toEqual(4);
        //     expect(object.rotation).toEqual(5);
        //     expect(object.skew.x).toEqual(6);
        //     expect(object.skew.y).toEqual(7);
        //     expect(object.pivot.x).toEqual(8);
        //     expect(object.pivot.y).toEqual(9);
        // });

        // it.skip('should convert zero scale to one', () =>
        // {
        //     const object = new Container();

        //     object.setTransform(1, 1, 0, 0, 1, 1, 1, 1, 1);

        //     expect(object.scale.x).toEqual(1);
        //     expect(object.scale.y).toEqual(1);
        // });
    });

    describe('worldVisible', () =>
    {
        // note: worldVisible does not exist and visible is not traversed when set on parent
        // it.skip('should traverse parents', () =>
        // {
        //     const grandParent = new Container();
        //     const parent = new Container();
        //     const child = new Container();

        //     grandParent.addChild(parent);
        //     parent.addChild(child);

        //     expect(child.worldVisible).toBe(true);

        //     grandParent.visible = false;

        //     expect(child.worldVisible).toBe(false);
        // });
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

    describe('enableTempParent', () =>
    {
        // note: incompatible apis, whats the equivalent?
        // it.skip('should allow to recalc children transform', () =>
        // {
        //     const child = new Container();
        //     const container = new Container();

        //     container.addChild(child);
        //     container.position.set(10, 10);
        //     child.position.set(15, 10);

        //     container.enableTempParent();
        //     container.updateTransform();
        //     container.disableTempParent(null);

        //     expect(child.worldTransform.tx).toEqual(25);
        //     expect(child.worldTransform.ty).toEqual(20);

        //     const cacheParent = child.enableTempParent();

        //     child.updateTransform();
        //     child.disableTempParent(cacheParent);

        //     expect(cacheParent).toEqual(container);
        //     expect(child.parent).toEqual(container);
        //     expect(child.worldTransform.tx).toEqual(15);
        //     expect(child.worldTransform.ty).toEqual(10);

        //     child.updateTransform();

        //     expect(child.worldTransform.tx).toEqual(25);
        //     expect(child.worldTransform.ty).toEqual(20);
        // });
    });

    describe('mask', () =>
    {
        // note: isMask is not a property, also renderable was not being set as expected when commenting out isMask
        // it.skip('should set isMask and renderable properties correctly even if the same mask is used by multiple objects',
        //     () =>
        //     {
        //         const mask1 = new Container();
        //         const mask2 = new Container();
        //         const container1 = new Container();
        //         const container2 = new Container();

        //         expect(mask1.isMask).toBe(false);
        //         expect(mask1.renderable).toBe(true);
        //         expect(mask2.isMask).toBe(false);
        //         expect(mask2.renderable).toBe(true);

        //         container1.mask = mask1;

        //         expect(mask1.isMask).toBe(true);
        //         expect(mask1.renderable).toBe(false);
        //         expect(mask2.isMask).toBe(false);
        //         expect(mask2.renderable).toBe(true);

        //         container1.mask = mask1;

        //         expect(mask1.isMask).toBe(true);
        //         expect(mask1.renderable).toBe(false);
        //         expect(mask2.isMask).toBe(false);
        //         expect(mask2.renderable).toBe(true);

        //         container2.mask = mask1;

        //         expect(mask1.isMask).toBe(true);
        //         expect(mask2.isMask).toBe(false);
        //         expect(mask1.renderable).toBe(false);
        //         expect(mask2.renderable).toBe(true);

        //         container1.mask = mask2;

        //         expect(mask1.isMask).toBe(true);
        //         expect(mask1.renderable).toBe(false);
        //         expect(mask2.isMask).toBe(true);
        //         expect(mask2.renderable).toBe(false);

        //         container2.mask = mask2;

        //         expect(mask1.isMask).toBe(false);
        //         expect(mask1.renderable).toBe(true);
        //         expect(mask2.isMask).toBe(true);
        //         expect(mask2.renderable).toBe(false);

        //         container1.mask = null;

        //         expect(mask1.isMask).toBe(false);
        //         expect(mask1.renderable).toBe(true);
        //         expect(mask2.isMask).toBe(true);
        //         expect(mask2.renderable).toBe(false);

        //         container2.mask = null;

        //         expect(mask1.isMask).toBe(false);
        //         expect(mask1.renderable).toBe(true);
        //         expect(mask2.isMask).toBe(false);
        //         expect(mask2.renderable).toBe(true);

        //         container1.mask = mask1;

        //         expect(mask1.isMask).toBe(true);
        //         expect(mask1.renderable).toBe(false);

        //         container1.destroy();

        //         expect(mask1.isMask).toBe(false);
        //         expect(mask1.renderable).toBe(true);
        //     }
        // );
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

    describe('worldAlpha', () =>
    {
        // note: worldAlpha does not exist neither does temp parent api
        // it.skip('should calculate the parent worldAlpha', () =>
        // {
        //     const parent = new Container();

        //     parent.alpha = 0.4;
        //     const child = new Container();

        //     child.alpha = 0.6;
        //     parent.addChild(child);

        //     parent.enableTempParent();
        //     parent.updateTransform();
        //     parent.disableTempParent(null);

        //     expect(child.worldAlpha).toBe(0.24);

        //     child.getLocalBounds();

        //     expect(child.worldAlpha).toBe(0.24);
        // });
    });
});
