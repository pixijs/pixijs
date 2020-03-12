const { Container, DisplayObject } = require('../');

function testAddChild(fn)
{
    return function ()
    {
        fn(function (container, obj)
        {
            container.addChild(obj);
        });
        fn(function (container, obj)
        {
            container.addChildAt(obj);
        });
    };
}

function testRemoveChild(fn)
{
    return function ()
    {
        fn(function (container, obj)
        {
            container.removeChild(obj);
        });
        fn(function (container, obj)
        {
            container.removeChildAt(container.children.indexOf(obj));
        });
        fn(function (container, obj)
        {
            container.removeChildren(container.children.indexOf(obj), container.children.indexOf(obj) + 1);
        });
    };
}

describe('PIXI.Container', function ()
{
    describe('parent', function ()
    {
        it('should be present when adding children to Container', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            expect(container.children.length).to.be.equals(0);
            container.addChild(child);
            expect(container.children.length).to.be.equals(1);
            expect(child.parent).to.be.equals(container);
        });
    });

    describe('events', function ()
    {
        it('should trigger "added", "removed", "childAdded", and "childRemoved" events on itself and children', function ()
        {
            const container = new Container();
            const child = new DisplayObject();
            let triggeredAdded = false;
            let triggeredRemoved = false;
            let triggeredChildAdded = false;
            let triggeredChildRemoved = false;

            child.on('added', (to) =>
            {
                triggeredAdded = true;
                expect(container.children.length).to.be.equals(1);
                expect(child.parent).to.be.equals(to);
            });
            child.on('removed', (from) =>
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

    describe('addChild', function ()
    {
        it('should remove from current parent', function ()
        {
            const parent = new Container();
            const container = new Container();
            const child = new DisplayObject();

            assertRemovedFromParent(parent, container, child, () => { container.addChild(child); });
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();
            const spy = sinon.spy(container, 'onChildrenChange');

            container.addChild(child);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should flag child transform and container bounds for recalculation', testAddChild(function (mockAddChild)
        {
            const container = new Container();
            const child = new Container();

            container.getBounds();
            child.getBounds();

            const boundsID = container._boundsID;
            const childParentID = child.transform._parentID;

            mockAddChild(container, child);

            expect(boundsID).to.not.be.equals(container._boundsID);
            expect(childParentID).to.not.be.equals(child.transform._parentID);
        }));
    });

    describe('removeChildAt', function ()
    {
        it('should remove from current parent', function ()
        {
            const parent = new Container();
            const child = new DisplayObject();

            assertRemovedFromParent(parent, null, child, () => { parent.removeChildAt(0); });
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            const spy = sinon.spy(container, 'onChildrenChange');

            container.removeChildAt(0);
            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });
    });

    describe('addChildAt', function ()
    {
        it('should allow placements at start', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());
            container.addChildAt(child, 0);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[0]).to.be.equals(child);
        });

        it('should allow placements at end', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());
            container.addChildAt(child, 1);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[1]).to.be.equals(child);
        });

        it('should throw on out-of-bounds', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());

            expect(() => container.addChildAt(child, -1)).to.throw('The index -1 supplied is out of bounds 1');
            expect(() => container.addChildAt(child, 2)).to.throw('The index 2 supplied is out of bounds 1');
        });

        it('should remove from current parent', function ()
        {
            const parent = new Container();
            const container = new Container();
            const child = new DisplayObject();

            assertRemovedFromParent(parent, container, child, () => { container.addChildAt(child, 0); });
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange');

            container.addChildAt(child, 0);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });
    });

    describe('removeChild', function ()
    {
        it('should ignore non-children', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            container.removeChild(new DisplayObject());

            expect(container.children.length).to.be.equals(1);
        });

        it('should remove all children supplied', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            expect(container.children.length).to.be.equals(2);

            container.removeChild(child1, child2);

            expect(container.children.length).to.be.equals(0);
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            const spy = sinon.spy(container, 'onChildrenChange');

            container.removeChild(child);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should flag transform for recalculation', testRemoveChild(function (mockRemoveChild)
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);
            container.getBounds();

            const childParentID = child.transform._parentID;
            const boundsID = container._boundsID;

            mockRemoveChild(container, child);

            expect(childParentID).to.not.be.equals(child.transform._parentID);
            expect(boundsID).to.not.be.equals(container._boundsID);
        }));
    });

    describe('getChildIndex', function ()
    {
        it('should return the correct index', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject(), child, new DisplayObject());

            expect(container.getChildIndex(child)).to.be.equals(1);
        });

        it('should throw when child does not exist', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            expect(() => container.getChildIndex(child))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });
    });

    describe('getChildAt', function ()
    {
        it('should throw when out-of-bounds', function ()
        {
            const container = new Container();

            expect(() => container.getChildAt(-1)).to.throw('getChildAt: Index (-1) does not exist.');
            expect(() => container.getChildAt(1)).to.throw('getChildAt: Index (1) does not exist.');
        });
    });

    describe('setChildIndex', function ()
    {
        it('should throw on out-of-bounds', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            expect(() => container.setChildIndex(child, -1)).to.throw('The index -1 supplied is out of bounds 1');
            expect(() => container.setChildIndex(child, 1)).to.throw('The index 1 supplied is out of bounds 1');
        });

        it('should throw when child does not belong', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());

            expect(() => container.setChildIndex(child, 0))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });

        it('should set index', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child, new DisplayObject(), new DisplayObject());
            expect(container.children.indexOf(child)).to.be.equals(0);

            container.setChildIndex(child, 1);
            expect(container.children.indexOf(child)).to.be.equals(1);

            container.setChildIndex(child, 2);
            expect(container.children.indexOf(child)).to.be.equals(2);

            container.setChildIndex(child, 0);
            expect(container.children.indexOf(child)).to.be.equals(0);
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child, new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange');

            container.setChildIndex(child, 1);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(1);
        });
    });

    describe('swapChildren', function ()
    {
        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            const spy = sinon.spy(container, 'onChildrenChange');

            container.swapChildren(child1, child2);
            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);

            // second call required to complete returned index coverage
            container.swapChildren(child1, child2);
            expect(spy).to.have.been.calledTwice;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should not call onChildrenChange if supplied children are equal', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child, new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange');

            container.swapChildren(child, child);

            expect(spy).to.not.have.been.called;
        });

        it('should throw if children do not belong', function ()
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child, new DisplayObject());

            expect(() => container.swapChildren(child, new DisplayObject()))
                .to.throw('The supplied DisplayObject must be a child of the caller');
            expect(() => container.swapChildren(new DisplayObject(), child))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });

        it('should result in swapped child positions', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            expect(container.children.indexOf(child1)).to.be.equals(0);
            expect(container.children.indexOf(child2)).to.be.equals(1);

            container.swapChildren(child1, child2);

            expect(container.children.indexOf(child2)).to.be.equals(0);
            expect(container.children.indexOf(child1)).to.be.equals(1);
        });
    });

    describe('updateTransform', function ()
    {
        it('should call sortChildren if sortDirty and sortableChildren are true', function ()
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

        it('should not call sortChildren if sortDirty is false', function ()
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

        it('should not call sortChildren if sortableChildren is false', function ()
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

    describe('render', function ()
    {
        it('should not render when object not visible', function ()
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container._render);

            container.visible = false;

            container.render();
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should not render when alpha is zero', function ()
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container._render);

            container.worldAlpha = 0;

            container.render();
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should not render when object not renderable', function ()
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container._render);

            container.renderable = false;

            container.render();
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should render children', function ()
        {
            const container = new Container();
            const child = new Container();
            const webGLSpy = sinon.spy(child, '_render');

            container.addChild(child);

            container.render();
            expect(webGLSpy).to.have.been.called;
        });
    });

    describe('removeChildren', function ()
    {
        it('should remove all children when no arguments supplied', function ()
        {
            const container = new Container();
            let removed = [];

            container.addChild(new DisplayObject(), new DisplayObject(), new DisplayObject());

            expect(container.children.length).to.be.equals(3);

            removed = container.removeChildren();

            expect(container.children.length).to.be.equals(0);
            expect(removed.length).to.be.equals(3);
        });

        it('should return empty array if no children', function ()
        {
            const container = new Container();
            const removed = container.removeChildren();

            expect(removed.length).to.be.equals(0);
        });

        it('should handle a range greater than length', function ()
        {
            const container = new Container();
            let removed = [];

            container.addChild(new DisplayObject());

            removed = container.removeChildren(0, 2);
            expect(removed.length).to.be.equals(1);
        });

        it('should throw outside acceptable range', function ()
        {
            const container = new Container();

            container.addChild(new DisplayObject());

            expect(() => container.removeChildren(2))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1, 1))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
        });
    });

    describe('destroy', function ()
    {
        it('should not destroy children by default', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);
            container.destroy();

            expect(container.children.length).to.be.equals(0);
            expect(child.transform).to.not.be.null;
        });

        it('should allow children destroy', function ()
        {
            let container = new Container();
            let child = new DisplayObject();

            container.addChild(child);
            container.destroy({ children: true });

            expect(container.children.length).to.be.equals(0);
            expect(container.transform).to.be.null;
            expect(child.transform).to.be.null;

            container = new Container();
            child = new DisplayObject();

            container.addChild(child);
            container.destroy(true);

            expect(container.children.length).to.be.equals(0);
            expect(container.transform).to.be.null;
            expect(child.transform).to.be.null;
        });
    });

    describe('getLocalBounds', function ()
    {
        it('should recalculate children transform by default', function ()
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

        it('should recalculate bounds if children position was changed', function ()
        {
            const root = new Container();
            const container = new Container();
            const child = new Container();
            let bounds = null;

            child._calculateBounds = function ()
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

    describe('width', function ()
    {
        it('should reset scale', function ()
        {
            const container = new Container();

            container.scale.x = 2;
            container.width = 5;

            expect(container.width).to.be.equals(0);
            expect(container.scale.x).to.be.equals(1);
        });
    });

    describe('height', function ()
    {
        it('should reset scale', function ()
        {
            const container = new Container();

            container.scale.y = 2;
            container.height = 5;

            expect(container.height).to.be.equals(0);
            expect(container.scale.y).to.be.equals(1);
        });
    });

    describe('sortDirty', function ()
    {
        it('should set sortDirty flag to true when adding a new child', function ()
        {
            const parent = new Container();
            const child = new DisplayObject();

            expect(parent.sortDirty).to.be.false;

            parent.addChild(child);

            expect(parent.sortDirty).to.be.true;
        });

        it('should set sortDirty flag to true when changing a child zIndex', function ()
        {
            const parent = new Container();
            const child = new DisplayObject();

            parent.addChild(child);

            parent.sortDirty = false;

            child.zIndex = 10;

            expect(parent.sortDirty).to.be.true;
        });
    });

    describe('sortChildren', function ()
    {
        it('should reset sortDirty flag', function ()
        {
            const container = new Container();

            container.sortDirty = true;

            container.sortChildren();

            expect(container.sortDirty).to.be.false;
        });

        it('should call sort when at least one child has a zIndex', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();
            const spy = sinon.spy(container.children, 'sort');

            child1.zIndex = 5;
            container.addChild(child1, child2);

            container.sortChildren();

            expect(spy).to.have.been.called;
        });

        it('should not call sort when children have no zIndex', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();
            const spy = sinon.spy(container.children, 'sort');

            container.addChild(child1, child2);

            container.sortChildren();

            expect(spy).to.not.have.been.called;
        });

        it('should sort children by zIndex value', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();
            const child3 = new DisplayObject();
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

        it('should sort children by current array order if zIndex values match', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();
            const child3 = new DisplayObject();
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

        it('should sort children in the same way despite being called multiple times', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();
            const child3 = new DisplayObject();
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

        it('should sort new children added correctly', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();
            const child3 = new DisplayObject();
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

        it('should sort children after a removal correctly', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();
            const child3 = new DisplayObject();
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

    function assertRemovedFromParent(parent, container, child, functionToAssert)
    {
        parent.addChild(child);

        expect(parent.children.length).to.be.equals(1);
        expect(child.parent).to.be.equals(parent);

        functionToAssert();

        expect(parent.children.length).to.be.equals(0);
        expect(child.parent).to.be.equals(container);
    }
});
