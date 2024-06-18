import { Container } from '../../src/scene/container/Container';
import { getWebGLRenderer } from '../utils/getRenderer';

function assertRemovedFromParent(parent: Container, container: Container, child: Container, functionToAssert: () => void)
{
    parent.addChild(child);

    expect(parent.children.length).toEqual(1);
    expect(child.parent).toEqual(parent);

    functionToAssert();

    expect(parent.children.length).toEqual(0);
    expect(child.parent).toEqual(container);
}

describe('Container Hierarchy', () =>
{
    describe('parent', () =>
    {
        it('should be present when adding children to Container', () =>
        {
            const container = new Container();
            const child = new Container();

            expect(container.children.length).toEqual(0);
            container.addChild(child);
            expect(container.children.length).toEqual(1);
            expect(child.parent).toEqual(container);
        });
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

        it('should flag child needs update once', () =>
        {
            const container = new Container();

            container.didChange = false;
            container.position.set(100, 100);

            expect(container.didChange).toBeTrue();
        });

        // todo: test that the updateFlags get set correctly
        // (v7) updateTransform() =>  updateLayerGroupTransforms(container.layerGroup, true);
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

            expect(container.children.length).toEqual(2);
            expect(container.children[0]).toEqual(child);
        });

        it('should allow placements at end', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(new Container());
            container.addChildAt(child, 1);

            expect(container.children.length).toEqual(2);
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

        // todo: check events for adding/removing using events
    });

    describe('removeChild', () =>
    {
        it('should ignore non-children', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);

            container.removeChild(new Container());

            expect(container.children.length).toEqual(1);
        });

        it('should remove all children supplied', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();

            container.addChild(child1, child2);

            expect(container.children.length).toEqual(2);

            container.removeChild(child1, child2);

            expect(container.children.length).toEqual(0);
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

            expect(container.children.length).toEqual(3);

            removed = container.removeChildren();

            expect(container.children.length).toEqual(0);
            expect(removed.length).toEqual(3);
        });

        it('should return empty array if no children', () =>
        {
            const container = new Container();
            const removed = container.removeChildren();

            expect(removed.length).toEqual(0);
        });

        it('should handle a range greater than length', () =>
        {
            const container = new Container();
            let removed = [];

            container.addChild(new Container());

            removed = container.removeChildren(0, 2);
            expect(removed.length).toEqual(1);
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

    describe('reparent', () =>
    {
        it('should remove from current parent', async () =>
        {
            const renderer = await getWebGLRenderer();
            const stage = new Container();
            const parent = new Container();
            const newParent = new Container();
            const child = new Container();

            newParent.position.x = 100;
            child.position.x = -100;

            parent.addChild(child);
            stage.addChild(parent, newParent);

            // render scene
            renderer.render(stage);

            newParent.reparentChild(child);

            // render scene
            renderer.render(stage);

            expect(child.worldTransform.tx).toEqual(-100);
        });
    });

    it('should reparent if container does not have a parent', async () =>
    {
        const renderer = await getWebGLRenderer();
        const stage = new Container();
        const newParent = new Container();
        const child = new Container();

        newParent.position.x = 100;
        newParent.scale.set(4);
        child.position.x = -100;
        child.scale.set(2);

        stage.addChild(child, newParent);

        // render scene
        renderer.render(stage);

        newParent.reparentChild(child);

        // render scene
        renderer.render(stage);

        expect(child.worldTransform.tx).toEqual(-100);
        expect(child.worldTransform.ty).toEqual(0);
        expect(child.worldTransform.a).toEqual(2);
        expect(child.worldTransform.d).toEqual(2);
    });
});
