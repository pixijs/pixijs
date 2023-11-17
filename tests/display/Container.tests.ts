// import { AlphaFilter } from '../../src/filters/defaults/alpha/AlphaFilter';
// import { Rectangle } from '../../src/maths/shapes/Rectangle';
import { Container } from '../../src/scene/container/Container';
// import { Graphics } from '../../src/scene/graphics/shared/Graphics';
import { getRenderer } from '../utils/getRenderer';

import type { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

// function testAddChild(fn: any)
// {
//     return () =>
//     {
//         fn((container: Container, obj: Container) =>
//         {
//             container.addChild(obj);
//         });
//         fn((container: Container, obj: Container) =>
//         {
//             // TODO: is this used?
//             // @ts-expect-error - legacy test
//             container.addChildAt(obj);
//         });
//     };
// }

// function testRemoveChild(fn: any)
// {
//     return () =>
//     {
//         fn((container: Container, obj: Container) =>
//         {
//             container.removeChild(obj);
//         });
//         fn((container: Container, obj: Container) =>
//         {
//             container.removeChildAt(container.children.indexOf(obj));
//         });
//         fn((container: Container, obj: Container) =>
//         {
//             container.removeChildren(container.children.indexOf(obj), container.children.indexOf(obj) + 1);
//         });
//     };
// }

describe('Container', () =>
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

    describe('events', () =>
    {
        it('should trigger "added", "removed", "childAdded", and "childRemoved" events on itself and children', () =>
        {
            const container = new Container();
            const child = new Container();
            let triggeredAdded = false;
            let triggeredRemoved = false;
            let triggeredChildAdded = false;
            let triggeredChildRemoved = false;

            child.on('added', (to: Container) =>
            {
                triggeredAdded = true;
                expect(container.children.length).toEqual(1);
                expect(child.parent).toEqual(to);
            });
            child.on('removed', (from: Container) =>
            {
                triggeredRemoved = true;
                expect(container.children.length).toEqual(0);
                expect(child.parent).toBeNull();
                expect(container).toEqual(from);
            });

            container.on('childAdded', (childAdded, containerFrom, index) =>
            {
                triggeredChildAdded = true;
                expect(child).toEqual(childAdded);
                expect(container).toEqual(containerFrom);
                expect(index).toEqual(0);
            });
            container.on('childRemoved', (childRemoved, containerFrom, index) =>
            {
                triggeredChildRemoved = true;
                expect(child).toEqual(childRemoved);
                expect(container).toEqual(containerFrom);
                expect(index).toEqual(0);
            });

            container.addChild(child);
            expect(triggeredAdded).toBe(true);
            expect(triggeredRemoved).toBe(false);
            expect(triggeredChildAdded).toBe(true);
            expect(triggeredChildRemoved).toBe(false);

            container.removeChild(child);
            expect(triggeredRemoved).toBe(true);
            expect(triggeredChildRemoved).toBe(true);
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

        it('should flag child needs update once ', () =>
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

            expect(() => container.addChildAt(child, -1)).toThrowError('The index -1 supplied is out of bounds 1');
            expect(() => container.addChildAt(child, 2)).toThrowError('The index 2 supplied is out of bounds 1');
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
                .toThrowError('The supplied Container must be a child of the caller');
        });
    });

    describe('getChildAt', () =>
    {
        it('should throw when out-of-bounds', () =>
        {
            const container = new Container();

            expect(() => container.getChildAt(-1)).toThrowError('getChildAt: Index (-1) does not exist.');
            expect(() => container.getChildAt(1)).toThrowError('getChildAt: Index (1) does not exist.');
        });
    });

    describe('setChildIndex', () =>
    {
        it('should throw on out-of-bounds', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);

            expect(() => container.setChildIndex(child, -1)).toThrowError('The index -1 supplied is out of bounds 1');
            expect(() => container.setChildIndex(child, 1)).toThrowError('The index 1 supplied is out of bounds 1');
        });

        it('should throw when child does not belong', () =>
        {
            const container = new Container();
            const child = new Container();

            container.addChild(new Container());

            expect(() => container.setChildIndex(child, 0))
                .toThrowError('The supplied Container must be a child of the caller');
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
                .toThrowError('The supplied Container must be a child of the caller');
            expect(() => container.swapChildren(new Container(), child))
                .toThrowError('The supplied Container must be a child of the caller');
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

    describe('render', () =>
    {
        // todo: convert to visual tests, maybe one test
        // note: what is container.render equivalent in v8?
        // it.skip('should not render when object not visible', () =>
        // {
        //     const container = new Container();
        //     const webGLSpy = jest.spyOn(container, '_render' as any);

        //     container.visible = false;

        //     container.render(undefined);
        //     expect(webGLSpy).not.toBeCalled();
        // });

        // note: what is container.render equivalent in v8?
        // it.skip('should not render when alpha is zero', () =>
        // {
        //     const container = new Container();
        //     const webGLSpy = jest.spyOn(container, '_render' as any);

        //     container.worldAlpha = 0;

        //     container.render(undefined);
        //     expect(webGLSpy).not.toBeCalled();
        // });

        // note: what is container.render equivalent in v8?
        // it.skip('should not render when object not renderable', () =>
        // {
        //     const container = new Container();
        //     const webGLSpy = jest.spyOn(container, '_render' as any);

        //     container.renderable = false;

        //     container.render(undefined);
        //     expect(webGLSpy).not.toBeCalled();
        // });

        // note: what is container.render equivalent in v8?
        // it.skip('should render children', () =>
        // {
        //     const container = new Container();
        //     const child = new Container();
        //     const webGLSpy = jest.spyOn(child, '_render' as any);

        //     container.addChild(child);

        //     container.render(undefined);
        //     expect(webGLSpy).toBeCalled();
        // });
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
                .toThrowError('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1))
                .toThrowError('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1, 1))
                .toThrowError('removeChildren: numeric values are outside the acceptable range.');
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

            expect(container.children.length).toEqual(0);
            expect(container.destroyed).toBe(true);
            expect(child.destroyed).toBe(false);
        });

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
    });

    describe('width', () =>
    {
        it('should reset scale', () =>
        {
            const container = new Container();

            container.scale.x = 2;
            container.width = 5;

            expect(container.width).toEqual(0);
            expect(container.scale.x).toEqual(1);
        });
    });

    describe('height', () =>
    {
        it('should reset scale', () =>
        {
            const container = new Container();

            container.scale.y = 2;
            container.height = 5;

            expect(container.height).toEqual(0);
            expect(container.scale.y).toEqual(1);
        });
    });

    describe('sortDirty', () =>
    {
        it('should set sortDirty flag to true when adding a new child', () =>
        {
            const parent = new Container();
            const child = new Container();

            parent.sortableChildren = true;

            expect(parent.sortDirty).toBe(false);

            parent.addChild(child);

            expect(parent.sortDirty).toBe(true);
        });

        it('should set sortDirty flag to true when changing a child zIndex', () =>
        {
            const parent = new Container();
            const child = new Container();

            parent.addChild(child);

            parent.sortDirty = false;

            child.zIndex = 10;

            expect(parent.sortDirty).toBe(true);
        });
    });

    describe('sortChildren', () =>
    {
        it('should reset sortDirty flag', () =>
        {
            const container = new Container();

            container.sortDirty = true;

            container.sortChildren();

            expect(container.sortDirty).toBe(false);
        });

        it('should call sort when at least one child has a zIndex', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const spy = jest.spyOn(container.children, 'sort' as any);

            child1.zIndex = 5;
            container.addChild(child1, child2);

            container.sortChildren();

            expect(spy).toBeCalled();
        });

        it('should not call sort when children have no zIndex', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const spy = jest.spyOn(container.children, 'sort' as any);

            container.addChild(child1, child2);

            container.sortChildren();

            expect(spy).not.toBeCalled();
        });

        it('should sort children by zIndex value', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(3);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(0);
        });

        it('should sort children by current array order if zIndex values match', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 20;
            child2.zIndex = 20;
            child3.zIndex = 10;
            child4.zIndex = 10;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(3);
            expect(container.children.indexOf(child3)).toEqual(0);
            expect(container.children.indexOf(child4)).toEqual(1);
        });

        it('should sort children in the same way despite being called multiple times', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 10;
            child2.zIndex = 15;
            child3.zIndex = 5;
            child4.zIndex = 0;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(3);
            expect(container.children.indexOf(child3)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(3);
            expect(container.children.indexOf(child3)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);

            child1.zIndex = 1;
            child2.zIndex = 1;
            child3.zIndex = 1;
            child4.zIndex = 1;

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(3);
            expect(container.children.indexOf(child3)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);
        });

        it('should sort new children added correctly', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(0);
            expect(container.children.indexOf(child3)).toEqual(1);

            container.addChild(child4);

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(0);
            expect(container.children.indexOf(child3)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(3);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(0);
        });

        it('should sort children after a removal correctly', () =>
        {
            const container = new Container();
            const child1 = new Container();
            const child2 = new Container();
            const child3 = new Container();
            const child4 = new Container();

            child1.zIndex = 20;
            child2.zIndex = 10;
            child3.zIndex = 15;

            container.addChild(child1, child2, child3, child4);

            expect(container.children.indexOf(child1)).toEqual(0);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(3);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(3);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child3)).toEqual(2);
            expect(container.children.indexOf(child4)).toEqual(0);

            container.removeChild(child3);

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);

            container.sortChildren();

            expect(container.children.indexOf(child1)).toEqual(2);
            expect(container.children.indexOf(child2)).toEqual(1);
            expect(container.children.indexOf(child4)).toEqual(0);
        });
    });

    function assertRemovedFromParent(parent: Container, container: Container, child: Container, functionToAssert: () => void)
    {
        parent.addChild(child);

        expect(parent.children.length).toEqual(1);
        expect(child.parent).toEqual(parent);

        functionToAssert();

        expect(parent.children.length).toEqual(0);
        expect(child.parent).toEqual(container);
    }

    describe('culling', () =>
    {
        let renderer: WebGLRenderer;
        let filterPush: jest.SpyInstance;

        beforeAll(async () =>
        {
            renderer = await getRenderer({ width: 100, height: 100 }) as WebGLRenderer;
            filterPush = jest.spyOn(renderer.filter, 'push');
        });

        afterAll(() =>
        {
            renderer.destroy();
            renderer = null;
            filterPush = null;
        });

        afterEach(() =>
        {
            filterPush.mockClear();
        });

        // note: cullable equivalent in v8?
        // it.skip('non-cullable container should always be rendered even if bounds do not intersect the frame', () =>
        // {
        //     const container = new Container();
        //     const graphics = container.addChild(
        //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
        //             .closePath()
        //     );

        //     container.cullable = false;
        //     graphics.x = -1000;
        //     graphics.y = -1000;

        //     const _renderContainer = jest.spyOn(container, '_render' as any);
        //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

        //     renderer.render(container);

        //     expect(_renderContainer).toBeCalled();
        //     expect(_renderGraphics).toBeCalled();
        // });

        // it.skip('cullable container should not be rendered if bounds do not intersect the frame', () =>
        // {
        //     const container = new Container();
        //     const graphics = container.addChild(
        //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
        //             .closePath()
        //     );

        //     container.cullable = true;
        //     graphics.x = 0;
        //     graphics.y = -10;

        //     const _renderContainer = jest.spyOn(container, '_render' as any);
        //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

        //     renderer.render(container);

        //     expect(_renderContainer).not.toBeCalled();
        //     expect(_renderGraphics).not.toBeCalled();
        // });

        // it.skip('cullable container should be rendered if bounds intersects the frame', () =>
        // {
        //     const container = new Container();
        //     const graphics = container.addChild(
        //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
        //             .closePath()
        //     );

        //     container.cullable = true;
        //     graphics.x = 0;
        //     graphics.y = -9;

        //     const _renderContainer = jest.spyOn(container, '_render' as any);
        //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

        //     renderer.render(container);

        //     expect(_renderContainer).toBeCalled();
        //     expect(_renderGraphics).toBeCalled();
        // });

        // it.skip('cullable container that contains a child with a padded filter (autoFit=true) '
        //     + 'such that the child in out of frame but the filter padding intersects the frame '
        //     + 'should render the filter padding but not the container or child', () =>
        // {
        //     const container = new Container();
        //     const graphics = container.addChild(
        //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
        //             .closePath()
        //     );
        //     const filter = new AlphaFilter();

        //     filter.padding = 30;
        //     filter.autoFit = true;

        //     container.cullable = true;
        //     graphics.filters = [filter];
        //     graphics.x = 0;
        //     graphics.y = -15;

        //     const _renderContainer = jest.spyOn(container, '_render' as any);
        //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

        //     renderer.render(container);

        //     expect(_renderContainer).not.toBeCalled();
        //     expect(_renderGraphics).not.toBeCalled();
        //     expect(filterPush).toBeCalled();
        // });

        // it.skip('cullable container that contains a child with a padded filter (autoFit=false) '
        //     + 'such that the child in out of frame but the filter padding intersects the frame '
        //     + 'should render the filtered child but not the container', () =>
        // {
        //     const container = new Container();
        //     const graphics = container.addChild(
        //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
        //             .closePath()
        //     );
        //     const filter = new AlphaFilter();

        //     filter.padding = 30;
        //     filter.autoFit = false;

        //     container.cullable = true;
        //     graphics.filters = [filter];
        //     graphics.x = 0;
        //     graphics.y = -15;

        //     const _renderContainer = jest.spyOn(container, '_render' as any);
        //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

        //     renderer.render(container);

        //     expect(_renderContainer).not.toBeCalled();
        //     expect(_renderGraphics).toBeCalled();
        //     expect(filterPush).toBeCalled();
        // });

        // it.skip('cullable container with a filter (autoFit=true) should not render the container or children '
        //     + 'if the bounds as well as the filter padding do no intersect the frame', () =>
        // {
        //     const container = new Container();
        //     const graphics = container.addChild(
        //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
        //             .closePath());
        //     const filter = new AlphaFilter();

        //     filter.padding = 5;
        //     filter.autoFit = true;

        //     container.cullable = true;
        //     container.filters = [filter];
        //     graphics.x = 0;
        //     graphics.y = -15;

        //     const _renderContainer = jest.spyOn(container, '_render' as any);
        //     const renderGraphics = jest.spyOn(graphics, 'render');

        //     renderer.render(container);

        //     expect(_renderContainer).not.toBeCalled();
        //     expect(renderGraphics).not.toBeCalled();
        //     expect(filterPush).toBeCalled();
        // });

        // it.skip('cullable container with cullArea should be rendered if the bounds intersect the frame', () =>
        // {
        //     const container = new Container();
        //     const graphics = container.addChild(
        //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
        //             .closePath()
        //     );

        //     container.cullable = true;
        //     container.cullArea = new Rectangle(-10, -10, 10, 10);
        //     container.x = container.y = 107.07;
        //     container.rotation = Math.PI / 4;

        //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

        //     renderer.render(container);

        //     expect(_renderGraphics).toBeCalled();
        // });

        // it.skip('cullable container with cullArea should not be rendered if the bounds do not intersect the frame', () =>
        // {
        //     const container = new Container();
        //     const graphics = container.addChild(
        //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
        //             .closePath()
        //     );

        //     container.cullable = true;
        //     container.cullArea = new Rectangle(-10, -10, 10, 10);
        //     container.x = container.y = 107.08;
        //     container.rotation = Math.PI / 4;

        //     const renderGraphics = jest.spyOn(graphics, 'render');

        //     renderer.render(container);

        //     expect(renderGraphics).not.toBeCalled();
        // });
    });
});
