'use strict';

describe('PIXI.Container', function ()
{
    describe('parent', function ()
    {
        it('should be present when adding children to Container', function ()
        {
            var container = new PIXI.Container();
            var child = new PIXI.DisplayObject();

            expect(container.children.length).to.be.equals(0);
            container.addChild(child);
            expect(container.children.length).to.be.equals(1);
            expect(child.parent).to.be.equals(container);
        });
    });

    describe('events', function ()
    {
        it('should trigger "added" and "removed" events on its children', function ()
        {
            var container = new PIXI.Container();
            var child = new PIXI.DisplayObject();
            var triggeredAdded = false;
            var triggeredRemoved = false;

            child.on('added', function (to)
            {
                triggeredAdded = true;
                expect(container.children.length).to.be.equals(1);
                expect(child.parent).to.be.equals(to);
            });
            child.on('removed', function (from)
            {
                triggeredRemoved = true;
                expect(container.children.length).to.be.equals(0);
                expect(child.parent).to.be.null;
                expect(container).to.be.equals(from);
            });

            container.addChild(child);
            expect(triggeredAdded).to.be.true;
            expect(triggeredRemoved).to.be.false;

            container.removeChild(child);
            expect(triggeredRemoved).to.be.true;
        });
    });

    describe('addChild', function ()
    {
        it('should remove from current parent', function ()
        {
            var parent = new PIXI.Container();
            var container = new PIXI.Container();
            var child = new PIXI.DisplayObject();

            assertRemovedFromParent(parent, container, child, function () { container.addChild(child); });
        });
    });

    describe('removeChildAt', function ()
    {
        it('should remove from current parent', function ()
        {
            var parent = new PIXI.Container();
            var child = new PIXI.DisplayObject();

            assertRemovedFromParent(parent, null, child, function () { parent.removeChildAt(0); });
        });
    });

    describe('addChildAt', function ()
    {
        it('should allow placements at start', function ()
        {
            var container = new PIXI.Container();
            var child = new PIXI.DisplayObject();

            container.addChild(new PIXI.DisplayObject());
            container.addChildAt(child, 0);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[0]).to.be.equals(child);
        });

        it('should allow placements at end', function ()
        {
            var container = new PIXI.Container();
            var child = new PIXI.DisplayObject();

            container.addChild(new PIXI.DisplayObject());
            container.addChildAt(child, 1);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[1]).to.be.equals(child);
        });

        it('should throw on out-of-bounds', function ()
        {
            var container = new PIXI.Container();
            var child = new PIXI.DisplayObject();

            container.addChild(new PIXI.DisplayObject());

            expect(function () { container.addChildAt(child, -1); }).to.throw('The index -1 supplied is out of bounds 1');
            expect(function () { container.addChildAt(child, 2); }).to.throw('The index 2 supplied is out of bounds 1');
        });

        it('should remove from current parent', function ()
        {
            var parent = new PIXI.Container();
            var container = new PIXI.Container();
            var child = new PIXI.DisplayObject();

            assertRemovedFromParent(parent, container, child, function () { container.addChildAt(child, 0); });
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
