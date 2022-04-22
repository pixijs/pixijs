import { DisplayObject, Container } from '@pixi/display';
import { RAD_TO_DEG, DEG_TO_RAD } from '@pixi/math';
import sinon from 'sinon';
import { expect } from 'chai';

describe('DisplayObject', function ()
{
    describe('constructor', function ()
    {
        it('should initialise properties', function ()
        {
            const object = new DisplayObject();

            expect(object.alpha).to.equal(1);
            expect(object.worldAlpha).to.equal(1);
            expect(object.renderable).to.be.true;
            expect(object.visible).to.be.true;
        });
    });

    describe('setParent', function ()
    {
        it('should add itself to a Container', function ()
        {
            const child = new DisplayObject();
            const container = new Container();

            expect(container.children.length).to.equal(0);
            child.setParent(container);
            expect(container.children.length).to.equal(1);
            expect(child.parent).to.equal(container);
        });

        it('should throw if not Container', function ()
        {
            const child = new DisplayObject();
            const notAContainer = {};

            expect(() => child.setParent()).to.throw('setParent: Argument must be a Container');
            expect(() => child.setParent(notAContainer)).to.throw('setParent: Argument must be a Container');
        });
    });

    describe('setTransform', function ()
    {
        it('should set correct properties', function ()
        {
            const object = new DisplayObject();

            object.setTransform(1, 2, 3, 4, 5, 6, 7, 8, 9);

            expect(object.position.x).to.be.equal(1);
            expect(object.position.y).to.be.equal(2);
            expect(object.scale.x).to.be.equal(3);
            expect(object.scale.y).to.be.equal(4);
            expect(object.rotation).to.be.equal(5);
            expect(object.skew.x).to.be.equal(6);
            expect(object.skew.y).to.be.equal(7);
            expect(object.pivot.x).to.be.equal(8);
            expect(object.pivot.y).to.be.equal(9);
        });

        it('should convert zero scale to one', function ()
        {
            const object = new DisplayObject();

            object.setTransform(1, 1, 0, 0, 1, 1, 1, 1, 1);

            expect(object.scale.x).to.be.equal(1);
            expect(object.scale.y).to.be.equal(1);
        });
    });

    describe('worldVisible', function ()
    {
        it('should traverse parents', function ()
        {
            const grandParent = new Container();
            const parent = new Container();
            const child = new DisplayObject();

            grandParent.addChild(parent);
            parent.addChild(child);

            expect(child.worldVisible).to.be.true;

            grandParent.visible = false;

            expect(child.worldVisible).to.be.false;
        });
    });

    describe('rotation', function ()
    {
        it('rotation and angle are different units of the same transformation', function ()
        {
            const object = new DisplayObject();

            expect(object.rotation).to.be.equal(0);
            expect(object.angle).to.be.equal(0);

            object.rotation = 2;

            expect(object.rotation).to.be.equal(2);
            expect(object.angle).to.be.equal(2 * RAD_TO_DEG);

            object.angle = 180;

            expect(object.rotation).to.be.equal(180 * DEG_TO_RAD);
            expect(object.angle).to.be.equal(180);
        });
    });

    describe('enableTempParent', function ()
    {
        it('should allow to recalc children transform', function ()
        {
            const child = new DisplayObject();
            const container = new Container();

            container.addChild(child);
            container.position.set(10, 10);
            child.position.set(15, 10);

            container.enableTempParent();
            container.updateTransform();
            container.disableTempParent(null);

            expect(child.worldTransform.tx).to.equal(25);
            expect(child.worldTransform.ty).to.equal(20);

            const cacheParent = child.enableTempParent();

            child.updateTransform();
            child.disableTempParent(cacheParent);

            expect(cacheParent).to.equal(container);
            expect(child.parent).to.equal(container);
            expect(child.worldTransform.tx).to.equal(15);
            expect(child.worldTransform.ty).to.equal(10);

            child.updateTransform();

            expect(child.worldTransform.tx).to.equal(25);
            expect(child.worldTransform.ty).to.equal(20);
        });
    });

    describe('mask', function ()
    {
        it('should set isMask and renderable properties correctly even if the same mask is used by multiple objects',
            function ()
            {
                const mask1 = new DisplayObject();
                const mask2 = new DisplayObject();
                const container1 = new Container();
                const container2 = new Container();

                expect(mask1.isMask).to.be.false;
                expect(mask1.renderable).to.be.true;
                expect(mask2.isMask).to.be.false;
                expect(mask2.renderable).to.be.true;

                container1.mask = mask1;

                expect(mask1.isMask).to.be.true;
                expect(mask1.renderable).to.be.false;
                expect(mask2.isMask).to.be.false;
                expect(mask2.renderable).to.be.true;

                container1.mask = mask1;

                expect(mask1.isMask).to.be.true;
                expect(mask1.renderable).to.be.false;
                expect(mask2.isMask).to.be.false;
                expect(mask2.renderable).to.be.true;

                container2.mask = mask1;

                expect(mask1.isMask).to.be.true;
                expect(mask2.isMask).to.be.false;
                expect(mask1.renderable).to.be.false;
                expect(mask2.renderable).to.be.true;

                container1.mask = mask2;

                expect(mask1.isMask).to.be.true;
                expect(mask1.renderable).to.be.false;
                expect(mask2.isMask).to.be.true;
                expect(mask2.renderable).to.be.false;

                container2.mask = mask2;

                expect(mask1.isMask).to.be.false;
                expect(mask1.renderable).to.be.true;
                expect(mask2.isMask).to.be.true;
                expect(mask2.renderable).to.be.false;

                container1.mask = null;

                expect(mask1.isMask).to.be.false;
                expect(mask1.renderable).to.be.true;
                expect(mask2.isMask).to.be.true;
                expect(mask2.renderable).to.be.false;

                container2.mask = null;

                expect(mask1.isMask).to.be.false;
                expect(mask1.renderable).to.be.true;
                expect(mask2.isMask).to.be.false;
                expect(mask2.renderable).to.be.true;

                container1.mask = mask1;

                expect(mask1.isMask).to.be.true;
                expect(mask1.renderable).to.be.false;

                container1.destroy();

                expect(mask1.isMask).to.be.false;
                expect(mask1.renderable).to.be.true;
            }
        );
    });

    describe('remove', function ()
    {
        it('should trigger removed listeners', function ()
        {
            const listener = sinon.spy();
            const child = new DisplayObject();
            const container = new Container();

            child.on('removed', listener);

            container.addChild(child);
            container.removeChild(child);

            expect(listener.calledOnce).to.be.true;

            container.addChild(child);
            child.destroy();

            expect(listener.calledTwice).to.be.true;
        });
    });

    describe('destroy', function ()
    {
        it('should trigger destroyed listeners', function ()
        {
            const listener = sinon.spy();
            const child = new DisplayObject();
            const container = new Container();

            child.on('destroyed', listener);

            container.addChild(child);
            container.removeChild(child);

            expect(listener.notCalled).to.be.true;

            container.addChild(child);
            child.destroy();

            expect(listener.calledOnce).to.be.true;
        });

        it('should trigger destroyed listeners once destruction is complete', function ()
        {
            let listenerCallCount = 0;
            const child = new DisplayObject();
            const container = new Container();

            child.on('destroyed', () =>
            {
                listenerCallCount++;
                expect(child.destroyed).to.be.true;
                expect(child.parent).to.be.null;
            });

            container.addChild(child);
            container.removeChild(child);

            expect(listenerCallCount).to.equal(0);

            container.addChild(child);
            child.destroy();

            expect(listenerCallCount).to.equal(1);
        });
    });
});
