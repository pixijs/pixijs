import { Container } from '../../../src/scene/container/Container';

describe('Container', () =>
{
    describe('parent', () =>
    {
        it('should be present when adding children to Container', () =>
        {
            const container = new Container();
            const child = new Container();

            expect(container.children).toHaveLength(0);
            container.addChild(child);
            expect(container.children).toHaveLength(1);
            expect(child.parent).toEqual(container);
        });
    });

    describe('events', () =>
    {
        // eslint-disable-next-line jest/no-commented-out-tests
        // it('should trigger "added", "removed", "childAdded", and "childRemoved" events on itself and children', () =>
        // {
        //     const container = new Container();
        //     const child = new Container();
        //     let triggeredAdded = false;
        //     let triggeredRemoved = false;
        //     let triggeredChildAdded = false;
        //     let triggeredChildRemoved = false;

        //     child.on('added', (to: Container) =>
        //     {
        //         triggeredAdded = true;
        //         expect(container.children.length).toEqual(1);
        //         expect(child.parent).toEqual(to);
        //     });
        //     child.on('removed', (from: Container) =>
        //     {
        //         triggeredRemoved = true;
        //         expect(container.children.length).toEqual(0);
        //         expect(child.parent).toBeNull();
        //         expect(container).toEqual(from);
        //     });

        //     container.on('childAdded', (childAdded, containerFrom, index) =>
        //     {
        //         triggeredChildAdded = true;
        //         expect(child).toEqual(childAdded);
        //         expect(container).toEqual(containerFrom);
        //         expect(index).toEqual(0);
        //     });
        //     container.on('childRemoved', (childRemoved, containerFrom, index) =>
        //     {
        //         triggeredChildRemoved = true;
        //         expect(child).toEqual(childRemoved);
        //         expect(container).toEqual(containerFrom);
        //         expect(index).toEqual(0);
        //     });

        //     container.addChild(child);
        //     expect(triggeredAdded).toBe(true);
        //     expect(triggeredRemoved).toBe(false);
        //     expect(triggeredChildAdded).toBe(true);
        //     expect(triggeredChildRemoved).toBe(false);

        //     container.removeChild(child);
        //     expect(triggeredRemoved).toBe(true);
        //     expect(triggeredChildRemoved).toBe(true);
        // });
    });

    describe('addChild', () =>
    {
        it('should remove from current parent', () =>
        {
            const parent = new Container();
            const container = new Container();
            const child = new Container();

            assertRemovedFromParent(parent, container, child, () => { container.addChild(child); });
        });
    });

    describe('removeChildAt', () =>
    {
        it('should remove from current parent', () =>
        {
            const parent = new Container();
            const child = new Container();

            assertRemovedFromParent(parent, null, child, () => { parent.removeChildAt(0); });
        });
    });

    describe('addChildAt', () =>
    {
        it('should allow placements at start', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(new Container());
            container.addChildAt(child, 0);

            expect(container.children).toHaveLength(2);
            expect(container.children[0]).toEqual(child);
        });

        it('should allow placements at end', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(new Container());
            container.addChildAt(child, 1);

            expect(container.children).toHaveLength(2);
            expect(container.children[1]).toEqual(child);
        });

        it('should throw on out-of-bounds', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(new Container());

            expect(() => container.addChildAt(child, -1)).toThrow('The index -1 supplied is out of bounds 1');
            expect(() => container.addChildAt(child, 2)).toThrow('The index 2 supplied is out of bounds 1');
        });

        it('should remove from current parent', () =>
        {
            const parent = new Container();
            const container = new Container();
            const child = new Container();

            assertRemovedFromParent(parent, container, child, () => { container.addChildAt(child, 0); });
        });
    });

    describe('removeChild', () =>
    {
        it('should ignore non-children', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);

            container.removeChild(new Container());

            expect(container.children).toHaveLength(1);
        });

        it('should remove all children supplied', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();

            container.addChild(child1, child2);

            expect(container.children).toHaveLength(2);

            container.removeChild(child1, child2);

            expect(container.children).toHaveLength(0);
        });
    });

    describe('getChildIndex', () =>
    {
        it('should return the correct index', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(new Container(), child, new Container());

            expect(container.getChildIndex(child)).toEqual(1);
        });

        it('should throw when child does not exist', () =>
        {
            const container = new Container();
            const child = new Container();

            expect(() => container.getChildIndex(child))
                .toThrow('The supplied Container must be a child of the caller');
        });
    });

    describe('getChildAt', () =>
    {
        it('should throw when out-of-bounds', () =>
        {
            const container = new Container();

            expect(() => container.getChildAt(-1)).toThrow('getChildAt: Index (-1) does not exist.');
            expect(() => container.getChildAt(1)).toThrow('getChildAt: Index (1) does not exist.');
        });
    });

    describe('setChildIndex', () =>
    {
        it('should throw on out-of-bounds', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);

            expect(() => container.setChildIndex(child, -1)).toThrow('The index -1 supplied is out of bounds 1');
            expect(() => container.setChildIndex(child, 1)).toThrow('The index 1 supplied is out of bounds 1');
        });

        it('should throw when child does not belong', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(new Container());

            expect(() => container.setChildIndex(child, 0))
                .toThrow('The supplied Container must be a child of the caller');
        });

        it('should set index', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child, new Container(), new Container());
            expect(container.children.indexOf(child)).toEqual(0);

            container.setChildIndex(child, 1);
            expect(container.children.indexOf(child)).toEqual(1);

            container.setChildIndex(child, 2);
            expect(container.children.indexOf(child)).toEqual(2);

            container.setChildIndex(child, 0);
            expect(container.children.indexOf(child)).toEqual(0);
        });
    });

    describe('swapChildren', () =>
    {
        it('should throw if children do not belong', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child, new Container());

            expect(() => container.swapChildren(child, new Container()))
                .toThrow('The supplied Container must be a child of the caller');
            expect(() => container.swapChildren(new Container(), child))
                .toThrow('The supplied Container must be a child of the caller');
        });

        it('should result in swapped child positions', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();

            container.addChild(child1, child2);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);

            container.swapChildren(child1, child2);

            expect(container.children.indexOf(child2)).toEqual(0);
            expect(container.children.indexOf(child1)).toEqual(1);
        });
    });

    describe('removeChildren', () =>
    {
        it('should remove all children when no arguments supplied', () =>
        {
            const container = new Container();
            let removed = [];

            container.addChild(new Container(), new Container(), new Container());

            expect(container.children).toHaveLength(3);

            removed = container.removeChildren();

            expect(container.children).toHaveLength(0);
            expect(removed).toHaveLength(3);
        });

        it('should return empty array if no children', () =>
        {
            const container = new Container();
            const removed = container.removeChildren();

            expect(removed).toHaveLength(0);
        });

        it('should handle a range greater than length', () =>
        {
            const container = new Container();
            let removed = [];

            container.addChild(new Container());

            removed = container.removeChildren(0, 2);
            expect(removed).toHaveLength(1);
        });

        it('should throw outside acceptable range', () =>
        {
            const container = new Container();

            container.addChild(new Container());

            expect(() => container.removeChildren(2))
                .toThrow('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1))
                .toThrow('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1, 1))
                .toThrow('removeChildren: numeric values are outside the acceptable range.');
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

            expect(container.children).toHaveLength(0);
            expect(child.position).not.toBeNull();
        });

        it('should allow children destroy', () =>
        {
            let container = new Container();
            let child = new Container();

            container.addChild(child);
            container.destroy({ children: true });

            expect(container.children).toHaveLength(0);
            expect(container.position).toBeNull();
            expect(child.position).toBeNull();

            container = new Container();
            child = new Container();

            container.addChild(child);
            container.destroy(true);

            expect(container.children).toHaveLength(0);
            expect(container.position).toBeNull();
            expect(child.position).toBeNull();
        });
    });

    function assertRemovedFromParent(parent: Container, container: Container, child: Container, functionToAssert: () => void)
    {
        parent.addChild(child);

        expect(parent.children).toHaveLength(1);
        expect(child.parent).toEqual(parent);

        functionToAssert();

        expect(parent.children).toHaveLength(0);
        expect(child.parent).toEqual(container);
    }
});
