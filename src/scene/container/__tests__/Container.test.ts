import { RenderLayer } from '../../layers/RenderLayer';
import { Container } from '../Container';
import { updateRenderGroupTransforms } from '../utils/updateRenderGroupTransforms';
import { Matrix } from '~/maths/matrix/Matrix';

describe('Container', () =>
{
    describe('constructor', () =>
    {
        it('should initialise properties', () =>
        {
            const object = new Container();

            expect(object.alpha).toEqual(1);
            expect(object.groupColor).toEqual(0xffffff);
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
                originX: 8,
                originY: 9,
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
            expect(object.origin.x).toEqual(8);
            expect(object.origin.y).toEqual(9);
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

    it('should accept constructor arguments', () =>
    {
        const x = 10;
        const y = 20;
        const angle = 90;
        const children = [new Container(), new Container()];

        const addedSpy = jest.spyOn(children[0], 'emit');

        const container = new Container({ x, y, angle, children });

        expect(container.x).toBe(x);
        expect(container.y).toBe(y);
        expect(container.angle).toBe(angle);
        expect(container.children).toContain(children[0]);
        expect(container.children).toContain(children[1]);
        expect(addedSpy).toHaveBeenCalledTimes(1);
    });

    it('should assign to parent correctly is passed to constructor', () =>
    {
        const parent = new Container();

        const addedSpy = jest.spyOn(parent, 'emit');

        const container = new Container({ parent });

        expect(parent.children).toEqual([container]);
        expect(container.parent).toEqual(parent);
        expect(addedSpy).toHaveBeenCalledTimes(1);
    });

    it('should a global position correctly', async () =>
    {
        const container = new Container({
            label: 'container',
        });

        const child = new Container({
            label: 'child',
        });

        container.addChild(child);

        container.position.set(10, 10);
        child.position.set(10, 10);

        expect(child.toGlobal({ x: 0, y: 0 })).toEqual({ x: 20, y: 20 });
        //   expect(container.getBounds()).toEqual({ x: 10, y: 10, width: 0, height: 0 });
    });

    it('should a global position correctly after an update', async () =>
    {
        const root = new Container({
            label: 'root',
            isRenderGroup: true,
        });

        const container = new Container({
            label: 'container',
        });

        const child = new Container({
            label: 'child',
        });

        root.addChild(container);

        container.addChild(child);

        container.position.set(10, 10);
        child.position.set(10, 10);

        // wrong!
        expect(child.toGlobal({ x: 0, y: 0 }, null, true)).toEqual({ x: 0, y: 0 });

        updateRenderGroupTransforms(container.parentRenderGroup, true);

        // right!!
        expect(child.toGlobal({ x: 0, y: 0 }, null, true)).toEqual({ x: 20, y: 20 });
    });

    it('should a local position correctly', async () =>
    {
        const child = new Container({
            label: 'child',
        });

        child.position.set(10, 10);

        expect(child.toLocal({ x: 0, y: 0 })).toEqual({ x: -10, y: -10 });
    });

    it('should a local position correctly when nested', async () =>
    {
        const root = new Container({
            label: 'root',
            isRenderGroup: true,
        });

        const container = new Container({
            label: 'container',
        });

        const otherContainer = new Container({
            label: 'container',
        });

        root.addChild(container);
        root.addChild(otherContainer);

        const child = new Container({
            label: 'child',
        });

        container.addChild(child);

        container.position.set(10, 10);
        child.position.set(10, 10);

        expect(child.toLocal({ x: 0, y: 0 }, otherContainer)).toEqual({ x: -20, y: -20 });

        //   expect(container.getBounds()).toEqual({ x: 10, y: 10, width: 0, height: 0 });
    });
    it('should a local position correctly after an update', async () =>
    {
        const root = new Container({
            label: 'root',
            isRenderGroup: true,
        });

        const container = new Container({
            label: 'container',
        });

        const otherContainer = new Container({
            label: 'container',
        });

        root.addChild(container);
        root.addChild(otherContainer);

        const child = new Container({
            label: 'child',
        });

        container.addChild(child);

        container.position.set(10, 10);
        child.position.set(10, 10);

        // wrong!
        expect(child.toLocal({ x: 0, y: 0 }, otherContainer, null, true)).toEqual({ x: 0, y: 0 });

        updateRenderGroupTransforms(container.parentRenderGroup, true);

        // right!
        expect(child.toLocal({ x: 0, y: 0 }, otherContainer, null, true)).toEqual({ x: -20, y: -20 });
        //   expect(container.getBounds()).toEqual({ x: 10, y: 10, width: 0, height: 0 });
    });

    it('should update the depth of a container if depth is modified', async () =>
    {
        const root = new Container({
            label: 'root',
            isRenderGroup: true,
        });

        const container1 = new Container({
            label: 'container1',
        });

        const container2 = new Container({
            label: 'container2',
        });

        const container3 = new Container({
            label: 'container3',
        });

        root.addChild(container1);
        root.addChild(container2);
        root.addChild(container3);

        root.renderGroup.structureDidChange = false;

        expect(root.sortableChildren).toEqual(false);

        container1.zIndex = 1;

        expect(root.sortDirty).toEqual(true);
        expect(root.renderGroup.structureDidChange).toEqual(true);

        root.sortChildren();

        expect(root.sortDirty).toEqual(false);
        expect(root.sortableChildren).toEqual(true);
        expect(root.children).toEqual([container2, container3, container1]);
    });

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

        it('should not destroy children by default', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);
            container.destroy();

            expect(container.children).toHaveLength(0);
            expect(child.position).not.toBeNull();
            expect(container.destroyed).toBe(true);
            expect(child.destroyed).toBe(false);
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

        it('should destroy render groups', () =>
        {
            const container = new Container({ isRenderGroup: true });

            const child = new Container({
                isRenderGroup: true,
                children: [new Container()],
            });

            const renderGroup = container.renderGroup;
            const renderGroup2 = child.renderGroup;

            const spy = jest.spyOn(renderGroup, 'destroy');
            const spy2 = jest.spyOn(renderGroup2, 'destroy');

            container.addChild(child);
            container.destroy({
                children: true,
            });

            expect(spy).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();

            expect(container.renderGroup).toBeNull();
            expect(child.renderGroup).toBeNull();

            expect(renderGroup.renderGroupParent).toBeNull();
            expect(renderGroup.childrenRenderablesToUpdate).toBeNull();
            expect(renderGroup.instructionSet).toBeNull();
            expect(renderGroup.renderGroupChildren).toBeNull();
            expect(renderGroup['_onRenderContainers']).toBeNull();

            expect(renderGroup2.renderGroupParent).toBeNull();
            expect(renderGroup2.childrenRenderablesToUpdate).toBeNull();
            expect(renderGroup2.instructionSet).toBeNull();
            expect(renderGroup2.renderGroupChildren).toBeNull();
            expect(renderGroup2['_onRenderContainers']).toBeNull();
        });

        it('should destroy children if children option is true', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);
            container.destroy({ children: true });

            expect(container.children.length).toEqual(0);
            expect(container.destroyed).toBeTrue();
            expect(child.destroyed).toBeTrue();
        });

        it('should detach destroyed children from their render layer', () =>
        {
            const parent = new Container();
            const child = new Container();
            const layer = new RenderLayer();

            // Add child to parent and attach to layer
            parent.addChild(child);
            layer.attach(child);

            expect(layer.renderLayerChildren).toContain(child);
            expect(child.parentRenderLayer).toBe(layer);

            // Destroy parent, which should destroy child and detach it from the layer
            parent.destroy({ children: false });

            expect(parent.destroyed).toBe(true);
            expect(layer.renderLayerChildren).not.toContain(child);
            expect(child.parentRenderLayer).toBeNull();
        });
    });

    describe('origin', () =>
    {
        describe('getter', () =>
        {
            it('should return default origin point (0, 0) initially', () =>
            {
                const container = new Container();
                const origin = container.origin;

                expect(origin.x).toBe(0);
                expect(origin.y).toBe(0);
            });

            it('should create new ObservablePoint when accessed', () =>
            {
                const container1 = new Container();
                const container2 = new Container();

                const origin1 = container1.origin;
                const origin2 = container2.origin;

                expect(origin1).not.toBe(origin2); // Different instances
            });
        });

        describe('setter', () =>
        {
            it('should set origin from number value', () =>
            {
                const container = new Container();

                container.origin = 50;

                expect(container.origin.x).toBe(50);
                expect(container.origin.y).toBe(50);
            });

            it('should set origin from PointData object', () =>
            {
                const container = new Container();

                container.origin = { x: 100, y: 200 };

                expect(container.origin.x).toBe(100);
                expect(container.origin.y).toBe(200);
            });

            it('should initialize ObservablePoint on first set', () =>
            {
                const temp = new Container();
                const container = new Container();

                // Access private property to check it's using default
                expect(container._origin).toBe(temp._origin);

                container.origin = { x: 10, y: 20 };

                // Should now have its own ObservablePoint
                expect(container._origin).not.toBe(temp._origin);
            });

            it('should trigger container update when origin changes', () =>
            {
                const container = new Container();
                const updateSpy = jest.spyOn(container, '_onUpdate');

                container.origin.set(25, 35);

                expect(updateSpy).toHaveBeenCalled();
            });
        });

        describe('debug warnings', () =>
        {
            let warnSpy: jest.SpyInstance;

            beforeEach(() =>
            {
                warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            });

            afterEach(() =>
            {
                warnSpy.mockRestore();
            });

            it('should warn when setting origin after pivot is already set', () =>
            {
                const container = new Container();

                // Set pivot first
                container.pivot = { x: 10, y: 10 };

                // Then set origin - should trigger warning
                container.origin = { x: 20, y: 20 };

                expect(warnSpy.mock.calls[0][1])
                    // eslint-disable-next-line max-len
                    .toEqual('Setting both a pivot and origin on a Container is not recommended. This can lead to unexpected behavior if not handled carefully.');
            });

            it('should warn when setting pivot after origin is already set', () =>
            {
                const container = new Container();

                // Set origin first
                container.origin = { x: 20, y: 20 };

                // Then set pivot - should trigger warning
                container.pivot = { x: 10, y: 10 };

                expect(warnSpy.mock.calls[0][1])
                    // eslint-disable-next-line max-len
                    .toEqual('Setting both a pivot and origin on a Container is not recommended. This can lead to unexpected behavior if not handled carefully.');
            });

            it('should not warn when only origin is set', () =>
            {
                const container = new Container();

                container.origin = { x: 20, y: 20 };

                expect(warnSpy).not.toHaveBeenCalled();
            });

            it('should not warn when only pivot is set', () =>
            {
                const container = new Container();

                container.pivot = { x: 10, y: 10 };

                expect(warnSpy).not.toHaveBeenCalled();
            });
        });

        describe('transform integration', () =>
        {
            it('should be included in updateTransform method', () =>
            {
                const container = new Container();

                container.updateTransform({
                    originX: 50,
                    originY: 75
                });

                expect(container.origin.x).toBe(50);
                expect(container.origin.y).toBe(75);
            });

            it('should preserve existing origin values when not specified in updateTransform', () =>
            {
                const container = new Container();

                container.origin.set(30, 40);

                container.updateTransform({
                    x: 100,
                    y: 200
                });

                expect(container.origin.x).toBe(30);
                expect(container.origin.y).toBe(40);
            });

            it('should allow partial origin updates in updateTransform', () =>
            {
                const container = new Container();

                container.origin.set(10, 20);

                container.updateTransform({
                    originX: 50
                });

                expect(container.origin.x).toBe(50);
                expect(container.origin.y).toBe(20); // Preserved
            });
        });

        describe('rotation around origin', () =>
        {
            it('should apply origin offset in local transform calculations', () =>
            {
                const container = new Container();

                container.position.set(100, 100);
                container.origin.set(25, 25);
                container.rotation = Math.PI / 4; // 45 degrees

                container.updateLocalTransform();

                const transform = container.localTransform;

                // The transform should include origin offset calculations
                expect(transform.tx).not.toBe(100); // Position affected by origin
                expect(transform.ty).not.toBe(100);

                // Verify the transform matrix includes rotation
                expect(Math.abs(transform.a - Math.cos(Math.PI / 4))).toBeLessThan(0.001);
                expect(Math.abs(transform.b - Math.sin(Math.PI / 4))).toBeLessThan(0.001);
            });
        });

        describe('constructor options', () =>
        {
            it('should accept origin in constructor options', () =>
            {
                const container = new Container({
                    origin: { x: 60, y: 80 }
                });

                expect(container.origin.x).toBe(60);
                expect(container.origin.y).toBe(80);
            });

            it('should accept numeric origin in constructor options', () =>
            {
                const container = new Container({
                    origin: 45
                });

                expect(container.origin.x).toBe(45);
                expect(container.origin.y).toBe(45);
            });
        });

        describe('observable behavior', () =>
        {
            it('should trigger updates when origin ObservablePoint changes', () =>
            {
                const container = new Container();
                const updateSpy = jest.spyOn(container, '_onUpdate');

                // Access origin to initialize it
                const origin = container.origin;

                // Clear any calls from initialization
                updateSpy.mockClear();

                // Modify the origin point
                origin.set(15, 25);

                expect(updateSpy).toHaveBeenCalled();
            });
        });

        describe('Matrix decomposition', () =>
        {
            it('should preserve origin when using setFromMatrix', () =>
            {
                const container = new Container();

                container.origin.set(20, 30);

                const matrix = new Matrix();

                matrix.translate(100, 150);
                matrix.rotate(Math.PI / 6);
                matrix.scale(1.5, 1.5);

                container.setFromMatrix(matrix);

                // Origin should be preserved during matrix decomposition
                expect(container.origin.x).toBe(20);
                expect(container.origin.y).toBe(30);
            });
        });

        describe('cleanup', () =>
        {
            it('should nullify origin on destroy', () =>
            {
                const container = new Container();

                // Initialize origin
                container.origin.set(10, 20);

                container.destroy();

                expect((container as any)._origin).toBeNull();
            });
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
