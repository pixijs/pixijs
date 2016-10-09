'use strict';

describe('PIXI.Container', () =>
{
    describe('parent', () =>
    {
        it('should be present when adding children to Container', () =>
        {
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            expect(container.children.length).to.be.equals(0);
            container.addChild(child);
            expect(container.children.length).to.be.equals(1);
            expect(child.parent).to.be.equals(container);
        });
    });

    describe('events', () =>
    {
        it('should trigger "added" and "removed" events on its children', () =>
        {
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();
            let triggeredAdded = false;
            let triggeredRemoved = false;

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

            container.addChild(child);
            expect(triggeredAdded).to.be.true;
            expect(triggeredRemoved).to.be.false;

            container.removeChild(child);
            expect(triggeredRemoved).to.be.true;
        });
    });

    describe('addChild', () =>
    {
        it('should remove from current parent', () =>
        {
            const parent = new PIXI.Container();
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            assertRemovedFromParent(parent, container, child, () => { container.addChild(child); });
        });
    });

    describe('removeChildAt', () =>
    {
        it('should remove from current parent', () =>
        {
            const parent = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            assertRemovedFromParent(parent, null, child, () => { parent.removeChildAt(0); });
        });
    });

    describe('addChildAt', () =>
    {
        it('should allow placements at start', () =>
        {
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            container.addChild(new PIXI.DisplayObject());
            container.addChildAt(child, 0);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[0]).to.be.equals(child);
        });

        it('should allow placements at end', () =>
        {
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            container.addChild(new PIXI.DisplayObject());
            container.addChildAt(child, 1);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[1]).to.be.equals(child);
        });

        it('should throw on out-of-bounds', () =>
        {
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            container.addChild(new PIXI.DisplayObject());

            expect(() => container.addChildAt(child, -1)).to.throw('The index -1 supplied is out of bounds 1');
            expect(() => container.addChildAt(child, 2)).to.throw('The index 2 supplied is out of bounds 1');
        });

        it('should remove from current parent', () =>
        {
            const parent = new PIXI.Container();
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            assertRemovedFromParent(parent, container, child, () => { container.addChildAt(child, 0); });
        });
    });

    describe('removeChild', () =>
    {
        it('should ignore non-children', () =>
        {
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            container.addChild(child);

            container.removeChild(new PIXI.DisplayObject());

            expect(container.children.length).to.be.equals(1);
        });

        it('should remove all children supplied', () =>
        {
            const container = new PIXI.Container();
            const child1 = new PIXI.DisplayObject();
            const child2 = new PIXI.DisplayObject();

            container.addChild(child1, child2);

            expect(container.children.length).to.be.equals(2);

            container.removeChild(child1, child2);

            expect(container.children.length).to.be.equals(0);
        });
    });

    describe('getChildIndex', () =>
    {
        it('should return the correct index', () =>
        {
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            container.addChild(new PIXI.DisplayObject(), child, new PIXI.DisplayObject());

            expect(container.getChildIndex(child)).to.be.equals(1);
        });

        it('should throw when child does not exist', () =>
        {
            const container = new PIXI.Container();
            const child = new PIXI.DisplayObject();

            expect(() => container.getChildIndex(child))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });
    });

    describe('getChildAt', () =>
    {
        it('should throw when out-of-bounds', () =>
        {
            const container = new PIXI.Container();

            expect(() => container.getChildAt(-1)).to.throw('getChildAt: Index (-1) does not exist.');
            expect(() => container.getChildAt(1)).to.throw('getChildAt: Index (1) does not exist.');
        });
    });
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
