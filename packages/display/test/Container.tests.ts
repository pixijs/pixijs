import { Renderer } from '@pixi/core';
import { Container, DisplayObject } from '@pixi/display';
import { AlphaFilter } from '@pixi/filter-alpha';
import { Graphics } from '@pixi/graphics';
import { Rectangle } from '@pixi/math';
import sinon from 'sinon';
import { expect } from 'chai';

function testAddChild(fn: any)
{
    return () =>
    {
        fn((container: Container, obj: Container) =>
        {
            container.addChild(obj);
        });
        fn((container: Container, obj: Container) =>
        {
            // TODO: is this used?
            // @ts-expect-error - legacy test
            container.addChildAt(obj);
        });
    };
}

function testRemoveChild(fn: any)
{
    return () =>
    {
        fn((container: Container, obj: Container) =>
        {
            container.removeChild(obj);
        });
        fn((container: Container, obj: Container) =>
        {
            container.removeChildAt(container.children.indexOf(obj));
        });
        fn((container: Container, obj: Container) =>
        {
            container.removeChildren(container.children.indexOf(obj), container.children.indexOf(obj) + 1);
        });
    };
}

describe('Container', () =>
{
    describe('parent', () =>
    {
        it('should be present when adding children to Container', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            expect(container.children.length).to.be.equals(0);
            container.addChild(child);
            expect(container.children.length).to.be.equals(1);
            expect(child.parent).to.be.equals(container);
        });
    });

    describe('events', () =>
    {
        it('should trigger "added", "removed", "childAdded", and "childRemoved" events on itself and children', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();
            let triggeredAdded = false;
            let triggeredRemoved = false;
            let triggeredChildAdded = false;
            let triggeredChildRemoved = false;

            child.on('added', (to: Container) =>
            {
                triggeredAdded = true;
                expect(container.children.length).to.be.equals(1);
                expect(child.parent).to.be.equals(to);
            });
            child.on('removed', (from: Container) =>
            {
                triggeredRemoved = true;
                expect(container.children.length).to.be.equals(0);
                expect(child.parent).to.be.null;
                expect(container).to.be.equals(from);
            });

            container.on('childAdded', (childAdded, containerFrom, index) =>
            {
                triggeredChildAdded = true;
                expect(child).to.be.equals(childAdded);
                expect(container).to.be.equals(containerFrom);
                expect(index).to.be.equals(0);
            });
            container.on('childRemoved', (childRemoved, containerFrom, index) =>
            {
                triggeredChildRemoved = true;
                expect(child).to.be.equals(childRemoved);
                expect(container).to.be.equals(containerFrom);
                expect(index).to.be.equals(0);
            });

            container.addChild(child);
            expect(triggeredAdded).to.be.true;
            expect(triggeredRemoved).to.be.false;
            expect(triggeredChildAdded).to.be.true;
            expect(triggeredChildRemoved).to.be.false;

            container.removeChild(child);
            expect(triggeredRemoved).to.be.true;
            expect(triggeredChildRemoved).to.be.true;
        });
    });

    describe('addChild', () =>
    {
        it('should remove from current parent', () =>
        {
            const parent = new Container();
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            assertRemovedFromParent(parent, container, child, () => { container.addChild(child); });
        });

        it('should call onChildrenChange', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();
            const spy = sinon.spy(container, 'onChildrenChange' as keyof Container);

            container.addChild(child);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should flag child transform and container bounds for recalculation', testAddChild(
            (mockAddChild: (container: Container, child: Container) => void) =>
            {
                const container = new Container();
                const child = new Container();

                container.getBounds();
                child.getBounds();

                const boundsID = container['_boundsID'];
                const childParentID = child.transform._parentID;

                mockAddChild(container, child);

                expect(boundsID).to.not.be.equals(container['_boundsID']);
                expect(childParentID).to.not.be.equals(child.transform._parentID);
            }));
    });

    describe('removeChildAt', () =>
    {
        it('should remove from current parent', () =>
        {
            const parent = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            assertRemovedFromParent(parent, null, child, () => { parent.removeChildAt(0); });
        });

        it('should call onChildrenChange', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            container.addChild(child);

            const spy = sinon.spy(container, 'onChildrenChange' as keyof Container);

            container.removeChildAt(0);
            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });
    });

    describe('addChildAt', () =>
    {
        it('should allow placements at start', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject());
            container.addChildAt(child, 0);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[0]).to.be.equals(child);
        });

        it('should allow placements at end', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject());
            container.addChildAt(child, 1);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[1]).to.be.equals(child);
        });

        it('should throw on out-of-bounds', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject());

            expect(() => container.addChildAt(child, -1)).to.throw('The index -1 supplied is out of bounds 1');
            expect(() => container.addChildAt(child, 2)).to.throw('The index 2 supplied is out of bounds 1');
        });

        it('should remove from current parent', () =>
        {
            const parent = new Container();
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            assertRemovedFromParent(parent, container, child, () => { container.addChildAt(child, 0); });
        });

        it('should call onChildrenChange', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange' as keyof Container);

            container.addChildAt(child, 0);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });
    });

    describe('removeChild', () =>
    {
        it('should ignore non-children', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            container.addChild(child);

            // @ts-expect-error - instantiating DisplayObject
            container.removeChild(new DisplayObject());

            expect(container.children.length).to.be.equals(1);
        });

        it('should remove all children supplied', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            expect(container.children.length).to.be.equals(2);

            container.removeChild(child1, child2);

            expect(container.children.length).to.be.equals(0);
        });

        it('should call onChildrenChange', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            container.addChild(child);

            const spy = sinon.spy(container, 'onChildrenChange' as keyof Container);

            container.removeChild(child);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should flag transform for recalculation', testRemoveChild(
            (mockRemoveChild: (c: Container, b: Container) => void) =>
            {
                const container = new Container();
                const child = new Container();

                container.addChild(child);
                container.getBounds();

                const childParentID = child.transform._parentID;
                const boundsID = container['_boundsID'];

                mockRemoveChild(container, child);

                expect(childParentID).to.not.be.equals(child.transform._parentID);
                expect(boundsID).to.not.be.equals(container['_boundsID']);
            }));
    });

    describe('getChildIndex', () =>
    {
        it('should return the correct index', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject(), child, new DisplayObject());

            expect(container.getChildIndex(child)).to.be.equals(1);
        });

        it('should throw when child does not exist', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            expect(() => container.getChildIndex(child))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });
    });

    describe('getChildAt', () =>
    {
        it('should throw when out-of-bounds', () =>
        {
            const container = new Container();

            expect(() => container.getChildAt(-1)).to.throw('getChildAt: Index (-1) does not exist.');
            expect(() => container.getChildAt(1)).to.throw('getChildAt: Index (1) does not exist.');
        });
    });

    describe('setChildIndex', () =>
    {
        it('should throw on out-of-bounds', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            container.addChild(child);

            expect(() => container.setChildIndex(child, -1)).to.throw('The index -1 supplied is out of bounds 1');
            expect(() => container.setChildIndex(child, 1)).to.throw('The index 1 supplied is out of bounds 1');
        });

        it('should throw when child does not belong', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject());

            expect(() => container.setChildIndex(child, 0))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });

        it('should set index', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(child, new DisplayObject(), new DisplayObject());
            expect(container.children.indexOf(child)).to.be.equals(0);

            container.setChildIndex(child, 1);
            expect(container.children.indexOf(child)).to.be.equals(1);

            container.setChildIndex(child, 2);
            expect(container.children.indexOf(child)).to.be.equals(2);

            container.setChildIndex(child, 0);
            expect(container.children.indexOf(child)).to.be.equals(0);
        });

        it('should call onChildrenChange', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(child, new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange' as keyof Container);

            container.setChildIndex(child, 1);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(1);
        });
    });

    describe('swapChildren', () =>
    {
        it('should call onChildrenChange', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            const spy = sinon.spy(container, 'onChildrenChange' as keyof Container);

            container.swapChildren(child1, child2);
            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);

            // second call required to complete returned index coverage
            container.swapChildren(child1, child2);
            expect(spy).to.have.been.calledTwice;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should not call onChildrenChange if supplied children are equal', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(child, new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange' as keyof Container);

            container.swapChildren(child, child);

            expect(spy).to.not.have.been.called;
        });

        it('should throw if children do not belong', () =>
        {
            const container = new Container();
            const child = new Container();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(child, new DisplayObject());

            // @ts-expect-error - instantiating DisplayObject
            expect(() => container.swapChildren(child, new DisplayObject()))
                .to.throw('The supplied DisplayObject must be a child of the caller');
            // @ts-expect-error - instantiating DisplayObject
            expect(() => container.swapChildren(new DisplayObject(), child))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });

        it('should result in swapped child positions', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            expect(container.children.indexOf(child1)).to.be.equals(0);
            expect(container.children.indexOf(child2)).to.be.equals(1);

            container.swapChildren(child1, child2);

            expect(container.children.indexOf(child2)).to.be.equals(0);
            expect(container.children.indexOf(child1)).to.be.equals(1);
        });
    });

    describe('updateTransform', () =>
    {
        it('should call sortChildren if sortDirty and sortableChildren are true', () =>
        {
            const parent = new Container();
            const container = new Container();
            const child = new Container();
            const canvasSpy = sinon.spy(container, 'sortChildren');

            parent.addChild(container);
            container.addChild(child);

            container.sortDirty = true;
            container.sortableChildren = true;

            container.updateTransform();

            expect(canvasSpy).to.have.been.called;
        });

        it('should not call sortChildren if sortDirty is false', () =>
        {
            const parent = new Container();
            const container = new Container();
            const child = new Container();
            const canvasSpy = sinon.spy(container, 'sortChildren');

            parent.addChild(container);
            container.addChild(child);

            container.sortDirty = false;
            container.sortableChildren = true;

            container.updateTransform();

            expect(canvasSpy).to.not.have.been.called;
        });

        it('should not call sortChildren if sortableChildren is false', () =>
        {
            const parent = new Container();
            const container = new Container();
            const child = new Container();
            const canvasSpy = sinon.spy(container, 'sortChildren');

            parent.addChild(container);
            container.addChild(child);

            container.sortDirty = true;
            container.sortableChildren = false;

            container.updateTransform();

            expect(canvasSpy).to.not.have.been.called;
        });
    });

    describe('render', () =>
    {
        it('should not render when object not visible', () =>
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container['_render']);

            container.visible = false;

            container.render(undefined);
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should not render when alpha is zero', () =>
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container['_render']);

            container.worldAlpha = 0;

            container.render(undefined);
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should not render when object not renderable', () =>
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container['_render']);

            container.renderable = false;

            container.render(undefined);
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should render children', () =>
        {
            const container = new Container();
            const child = new Container();
            const webGLSpy = sinon.spy(child, '_render' as keyof Container);

            container.addChild(child);

            container.render(undefined);
            expect(webGLSpy).to.have.been.called;
        });
    });

    describe('removeChildren', () =>
    {
        it('should remove all children when no arguments supplied', () =>
        {
            const container = new Container();
            let removed = [];

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject(), new DisplayObject(), new DisplayObject());

            expect(container.children.length).to.be.equals(3);

            removed = container.removeChildren();

            expect(container.children.length).to.be.equals(0);
            expect(removed.length).to.be.equals(3);
        });

        it('should return empty array if no children', () =>
        {
            const container = new Container();
            const removed = container.removeChildren();

            expect(removed.length).to.be.equals(0);
        });

        it('should handle a range greater than length', () =>
        {
            const container = new Container();
            let removed = [];

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject());

            removed = container.removeChildren(0, 2);
            expect(removed.length).to.be.equals(1);
        });

        it('should throw outside acceptable range', () =>
        {
            const container = new Container();

            // @ts-expect-error - instantiating DisplayObject
            container.addChild(new DisplayObject());

            expect(() => container.removeChildren(2))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1, 1))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
        });
    });

    describe('destroy', () =>
    {
        it('should not destroy children by default', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            container.addChild(child);
            container.destroy();

            expect(container.children.length).to.be.equals(0);
            expect(child.transform).to.not.be.null;
        });

        it('should allow children destroy', () =>
        {
            let container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            let child = new DisplayObject();

            container.addChild(child);
            container.destroy({ children: true });

            expect(container.children.length).to.be.equals(0);
            expect(container.transform).to.be.null;
            expect(child.transform).to.be.null;

            container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            child = new DisplayObject();

            container.addChild(child);
            container.destroy(true);

            expect(container.children.length).to.be.equals(0);
            expect(container.transform).to.be.null;
            expect(child.transform).to.be.null;
        });
    });

    describe('getLocalBounds', () =>
    {
        it('should recalculate children transform by default', () =>
        {
            const root = new Container();
            const container = new Container();
            const child = new Container();

            root.addChild(container);
            container.addChild(child);

            container.position.set(10, 10);
            child.position.set(20, 30);

            container.updateTransform();
            container.getLocalBounds();

            expect(child.transform.worldTransform.tx).to.equal(30);
            expect(child.transform.worldTransform.ty).to.equal(40);
        });

        it('should recalculate bounds if children position was changed', () =>
        {
            const root = new Container();
            const container = new Container();
            const child = new Container();
            let bounds = null;

            // eslint-disable-next-line func-names
            child['_calculateBounds'] = function ()
            {
                this._bounds.addFrame(this.transform, 0, 0, 1, 1);
            };

            root.addChild(container);
            container.addChild(child);
            container.position.set(10, 10);
            container.updateTransform();

            child.position.set(20, 30);
            bounds = container.getLocalBounds();
            expect(bounds.x).to.equal(20);
            expect(bounds.y).to.equal(30);
            child.position.set(5, 5);
            bounds = container.getLocalBounds();
            expect(bounds.x).to.equal(5);
            expect(bounds.y).to.equal(5);
        });
    });

    describe('width', () =>
    {
        it('should reset scale', () =>
        {
            const container = new Container();

            container.scale.x = 2;
            container.width = 5;

            expect(container.width).to.be.equals(0);
            expect(container.scale.x).to.be.equals(1);
        });
    });

    describe('height', () =>
    {
        it('should reset scale', () =>
        {
            const container = new Container();

            container.scale.y = 2;
            container.height = 5;

            expect(container.height).to.be.equals(0);
            expect(container.scale.y).to.be.equals(1);
        });
    });

    describe('sortDirty', () =>
    {
        it('should set sortDirty flag to true when adding a new child', () =>
        {
            const parent = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            expect(parent.sortDirty).to.be.false;

            parent.addChild(child);

            expect(parent.sortDirty).to.be.true;
        });

        it('should set sortDirty flag to true when changing a child zIndex', () =>
        {
            const parent = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child = new DisplayObject();

            parent.addChild(child);

            parent.sortDirty = false;

            child.zIndex = 10;

            expect(parent.sortDirty).to.be.true;
        });
    });

    describe('sortChildren', () =>
    {
        it('should reset sortDirty flag', () =>
        {
            const container = new Container();

            container.sortDirty = true;

            container.sortChildren();

            expect(container.sortDirty).to.be.false;
        });

        it('should call sort when at least one child has a zIndex', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();
            const spy = sinon.spy(container.children, 'sort');

            child1.zIndex = 5;
            container.addChild(child1, child2);

            container.sortChildren();

            expect(spy).to.have.been.called;
        });

        it('should not call sort when children have no zIndex', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();
            const spy = sinon.spy(container.children, 'sort');

            container.addChild(child1, child2);

            container.sortChildren();

            expect(spy).to.not.have.been.called;
        });

        it('should sort children by zIndex value', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child3 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child4 = new DisplayObject();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).to.be.equals(0);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child3)).to.be.equals(2);
            expect(container.children.indexOf(child4)).to.be.equals(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).to.be.equals(3);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child3)).to.be.equals(2);
            expect(container.children.indexOf(child4)).to.be.equals(0);
        });

        it('should sort children by current array order if zIndex values match', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child3 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child4 = new DisplayObject();

            child1.zIndex = 20;
            child2.zIndex = 20;
            child3.zIndex = 10;
            child4.zIndex = 10;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).to.be.equals(0);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child3)).to.be.equals(2);
            expect(container.children.indexOf(child4)).to.be.equals(3);

            container.sortChildren();

            expect(child1._lastSortedIndex).to.be.equals(0);
            expect(child2._lastSortedIndex).to.be.equals(1);
            expect(child3._lastSortedIndex).to.be.equals(2);
            expect(child4._lastSortedIndex).to.be.equals(3);

            expect(container.children.indexOf(child1)).to.be.equals(2);
            expect(container.children.indexOf(child2)).to.be.equals(3);
            expect(container.children.indexOf(child3)).to.be.equals(0);
            expect(container.children.indexOf(child4)).to.be.equals(1);
        });

        it('should sort children in the same way despite being called multiple times', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child3 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child4 = new DisplayObject();

            child1.zIndex = 10;
            child2.zIndex = 15;
            child3.zIndex = 5;
            child4.zIndex = 0;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).to.be.equals(0);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child3)).to.be.equals(2);
            expect(container.children.indexOf(child4)).to.be.equals(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).to.be.equals(2);
            expect(container.children.indexOf(child2)).to.be.equals(3);
            expect(container.children.indexOf(child3)).to.be.equals(1);
            expect(container.children.indexOf(child4)).to.be.equals(0);

            container.sortChildren();

            expect(container.children.indexOf(child1)).to.be.equals(2);
            expect(container.children.indexOf(child2)).to.be.equals(3);
            expect(container.children.indexOf(child3)).to.be.equals(1);
            expect(container.children.indexOf(child4)).to.be.equals(0);

            child1.zIndex = 1;
            child2.zIndex = 1;
            child3.zIndex = 1;
            child4.zIndex = 1;

            container.sortChildren();

            expect(container.children.indexOf(child1)).to.be.equals(2);
            expect(container.children.indexOf(child2)).to.be.equals(3);
            expect(container.children.indexOf(child3)).to.be.equals(1);
            expect(container.children.indexOf(child4)).to.be.equals(0);
        });

        it('should sort new children added correctly', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child3 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child4 = new DisplayObject();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3);

            expect(container.children.indexOf(child1)).to.be.equals(0);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child3)).to.be.equals(2);

            container.sortChildren();

            expect(container.children.indexOf(child1)).to.be.equals(2);
            expect(container.children.indexOf(child2)).to.be.equals(0);
            expect(container.children.indexOf(child3)).to.be.equals(1);

            container.addChild(child4);

            expect(container.children.indexOf(child1)).to.be.equals(2);
            expect(container.children.indexOf(child2)).to.be.equals(0);
            expect(container.children.indexOf(child3)).to.be.equals(1);
            expect(container.children.indexOf(child4)).to.be.equals(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).to.be.equals(3);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child3)).to.be.equals(2);
            expect(container.children.indexOf(child4)).to.be.equals(0);
        });

        it('should sort children after a removal correctly', () =>
        {
            const container = new Container();
            // @ts-expect-error - instantiating DisplayObject
            const child1 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child2 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child3 = new DisplayObject();
            // @ts-expect-error - instantiating DisplayObject
            const child4 = new DisplayObject();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).to.be.equals(0);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child3)).to.be.equals(2);
            expect(container.children.indexOf(child4)).to.be.equals(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).to.be.equals(3);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child3)).to.be.equals(2);
            expect(container.children.indexOf(child4)).to.be.equals(0);

            container.removeChild(child3);

            expect(container.children.indexOf(child1)).to.be.equals(2);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child4)).to.be.equals(0);

            container.sortChildren();

            expect(container.children.indexOf(child1)).to.be.equals(2);
            expect(container.children.indexOf(child2)).to.be.equals(1);
            expect(container.children.indexOf(child4)).to.be.equals(0);
        });
    });

    function assertRemovedFromParent(parent: Container, container: Container, child: Container, functionToAssert: () => void)
    {
        parent.addChild(child);

        expect(parent.children.length).to.be.equals(1);
        expect(child.parent).to.be.equals(parent);

        functionToAssert();

        expect(parent.children.length).to.be.equals(0);
        expect(child.parent).to.be.equals(container);
    }

    describe('culling', () =>
    {
        let renderer: Renderer;
        let filterPush: sinon.SinonSpy;

        before(() =>
        {
            renderer = new Renderer({ width: 100, height: 100 });
            filterPush = sinon.spy(renderer.filter, 'push');
        });

        after(() =>
        {
            renderer.destroy();
            renderer = null;
            filterPush = null;
        });

        afterEach(() =>
        {
            filterPush.resetHistory();
        });

        it('noncullable container should always be rendered even if bounds do not intersect the frame', () =>
        {
            const container = new Container();
            const graphics = container.addChild(new Graphics().beginFill().drawRect(0, 0, 10, 10).endFill());

            container.cullable = false;
            graphics.x = -1000;
            graphics.y = -1000;

            const _renderContainer = sinon.spy(container, '_render' as keyof Container);
            const _renderGraphics = sinon.spy(graphics, '_render' as keyof Graphics);

            renderer.render(container);

            expect(_renderContainer).to.have.been.called;
            expect(_renderGraphics).to.have.been.called;
        });

        it('cullable container should not be rendered if bounds do not intersect the frame', () =>
        {
            const container = new Container();
            const graphics = container.addChild(new Graphics().beginFill().drawRect(0, 0, 10, 10).endFill());

            container.cullable = true;
            graphics.x = 0;
            graphics.y = -10;

            const _renderContainer = sinon.spy(container, '_render' as keyof Container);
            const _renderGraphics = sinon.spy(graphics, '_render' as keyof Graphics);

            renderer.render(container);

            expect(_renderContainer).to.not.have.been.called;
            expect(_renderGraphics).to.not.have.been.called;
        });

        it('cullable container should be rendered if bounds intersects the frame', () =>
        {
            const container = new Container();
            const graphics = container.addChild(new Graphics().beginFill().drawRect(0, 0, 10, 10).endFill());

            container.cullable = true;
            graphics.x = 0;
            graphics.y = -9;

            const _renderContainer = sinon.spy(container, '_render' as keyof Container);
            const _renderGraphics = sinon.spy(graphics, '_render' as keyof Graphics);

            renderer.render(container);

            expect(_renderContainer).to.have.been.called;
            expect(_renderGraphics).to.have.been.called;
        });

        it('cullable container that contains a child with a padded filter (autoFit=true) '
            + 'such that the child in out of frame but the filter padding intersects the frame '
            + 'should render the filter padding but not the container or child', () =>
        {
            const container = new Container();
            const graphics = container.addChild(new Graphics().beginFill().drawRect(0, 0, 10, 10).endFill());
            const filter = new AlphaFilter();

            filter.padding = 30;
            filter.autoFit = true;

            container.cullable = true;
            graphics.filters = [filter];
            graphics.x = 0;
            graphics.y = -15;

            const _renderContainer = sinon.spy(container, '_render' as keyof Container);
            const _renderGraphics = sinon.spy(graphics, '_render' as keyof Graphics);

            renderer.render(container);

            expect(_renderContainer).to.not.have.been.called;
            expect(_renderGraphics).to.not.have.been.called;
            expect(filterPush).to.have.been.called;
        });

        it('cullable container that contains a child with a padded filter (autoFit=false) '
            + 'such that the child in out of frame but the filter padding intersects the frame '
            + 'should render the filtered child but not the container', () =>
        {
            const container = new Container();
            const graphics = container.addChild(new Graphics().beginFill().drawRect(0, 0, 10, 10).endFill());
            const filter = new AlphaFilter();

            filter.padding = 30;
            filter.autoFit = false;

            container.cullable = true;
            graphics.filters = [filter];
            graphics.x = 0;
            graphics.y = -15;

            const _renderContainer = sinon.spy(container, '_render' as keyof Container);
            const _renderGraphics = sinon.spy(graphics, '_render' as keyof Graphics);

            renderer.render(container);

            expect(_renderContainer).to.not.have.been.called;
            expect(_renderGraphics).to.have.been.called;
            expect(filterPush).to.have.been.called;
        });

        it('cullable container with a filter (autoFit=true) should not render the container or children '
            + 'if the bounds as well as the filter padding do no intersect the frame', () =>
        {
            const container = new Container();
            const graphics = container.addChild(new Graphics().beginFill().drawRect(0, 0, 10, 10).endFill());
            const filter = new AlphaFilter();

            filter.padding = 5;
            filter.autoFit = true;

            container.cullable = true;
            container.filters = [filter];
            graphics.x = 0;
            graphics.y = -15;

            const _renderContainer = sinon.spy(container, '_render' as keyof Container);
            const renderGraphics = sinon.spy(graphics, 'render');

            renderer.render(container);

            expect(_renderContainer).to.not.have.been.called;
            expect(renderGraphics).to.not.have.been.called;
            expect(filterPush).to.have.been.called;
        });

        it('cullable container with cullArea should be rendered if the bounds intersect the frame', () =>
        {
            const container = new Container();
            const graphics = container.addChild(new Graphics().beginFill().drawRect(0, 0, 10, 10).endFill());

            container.cullable = true;
            container.cullArea = new Rectangle(-10, -10, 10, 10);
            container.x = container.y = 107.07;
            container.rotation = Math.PI / 4;

            const _renderGraphics = sinon.spy(graphics, '_render' as keyof Graphics);

            renderer.render(container);

            expect(_renderGraphics).to.have.been.called;
        });

        it('cullable container with cullArea should not be rendered if the bounds do not intersect the frame', () =>
        {
            const container = new Container();
            const graphics = container.addChild(new Graphics().beginFill().drawRect(0, 0, 10, 10).endFill());

            container.cullable = true;
            container.cullArea = new Rectangle(-10, -10, 10, 10);
            container.x = container.y = 107.08;
            container.rotation = Math.PI / 4;

            const renderGraphics = sinon.spy(graphics, 'render');

            renderer.render(container);

            expect(renderGraphics).to.not.have.been.called;
        });
    });
});
