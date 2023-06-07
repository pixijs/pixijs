import { Container } from '../../src/rendering/scene/Container';
import { updateLayerGroupTransforms } from '../../src/rendering/scene/utils/updateLayerGroupTransforms';

describe('Container Tests', () =>
{
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
            layer: true,
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

        updateLayerGroupTransforms(container.layerGroup, true);

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

    it('should a local position correctly', async () =>
    {
        const root = new Container({
            label: 'root',
            layer: true,
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
            layer: true,
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

        updateLayerGroupTransforms(container.layerGroup, true);

        // right!
        expect(child.toLocal({ x: 0, y: 0 }, otherContainer, null, true)).toEqual({ x: -20, y: -20 });
        //   expect(container.getBounds()).toEqual({ x: 10, y: 10, width: 0, height: 0 });
    });
});

// Test to cover
