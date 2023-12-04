import { Container } from '../../src/scene/container/Container';
import { updateRenderGroupTransforms } from '../../src/scene/container/utils/updateRenderGroupTransforms';

describe('Container Tests', () =>
{
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

        updateRenderGroupTransforms(container.renderGroup, true);

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

        updateRenderGroupTransforms(container.renderGroup, true);

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
});

// Test to cover
