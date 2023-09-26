import { Container } from '../../src/scene/container/Container';
import { updateLayerGroupTransforms } from '../../src/scene/container/utils/updateLayerGroupTransforms';

describe('Transform Visibility', () =>
{
    it('should not cause a rebuild if visibility is changed on a layer', async () =>
    {
        const root = new Container({ layer: true });

        root.layerGroup.structureDidChange = false;

        root.visible = false;

        expect(root.visible).toEqual(false);
        expect(root.layerGroup.structureDidChange).toEqual(false);
    });

    it('should cause a rebuild if visibility is changed on a child', async () =>
    {
        const root = new Container({ layer: true });

        root.layerGroup.structureDidChange = false;

        const child = new Container();

        root.addChild(child);

        child.visible = false;

        expect(root.layerGroup.structureDidChange).toEqual(true);
    });

    it('should inherit visibility on the scene graph', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child' });

        root.addChild(container);

        container.addChild(child);

        container.visible = false;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerVisibleRenderable).toEqual(0b01);

        container.visible = true;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerVisibleRenderable).toEqual(0b11);
    });

    it('should inherit visibility when children swapped around on the scene graph', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container' });
        const containerHidden = new Container({ label: 'containerAdd' });

        const child = new Container({ label: 'child' });

        root.addChild(container);
        root.addChild(containerHidden);

        container.addChild(child);

        containerHidden.visible = false;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerVisibleRenderable).toEqual(0b11);

        containerHidden.addChild(child);

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerVisibleRenderable).toEqual(0b01);
    });

    it('should not cause a rebuild if renderable is changed on a layer', async () =>
    {
        const root = new Container({ layer: true });

        root.layerGroup.structureDidChange = false;

        root.renderable = false;

        expect(root.layerGroup.structureDidChange).toEqual(false);
    });

    it('should not cause a rebuild if renderable is changed on a layer', async () =>
    {
        const root = new Container({ layer: true });

        root.layerGroup.structureDidChange = false;

        root.renderable = false;

        expect(root.renderable).toEqual(false);

        expect(root.layerGroup.structureDidChange).toEqual(false);
    });

    it('should set both renderable and visible correctly in layerVisibleRenderable prop', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child' });

        root.addChild(container);

        container.addChild(child);

        container.visible = false;
        container.renderable = false;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerVisibleRenderable).toEqual(0b00);

        container.visible = true;
        container.renderable = true;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerVisibleRenderable).toEqual(0b11);
    });

    it('should cause a rebuild if visibility is changed on a child before it is added', async () =>
    {
        const root = new Container({ layer: true });
        const container = new Container();

        root.layerGroup.structureDidChange = false;

        const child = new Container();

        child.visible = false;
        container.visible = false;

        root.addChild(container);
        container.addChild(child);

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(root.layerGroup.structureDidChange).toEqual(true);

        root.layerGroup.structureDidChange = false;

        container.visible = true;

        expect(root.layerGroup.structureDidChange).toEqual(true);
    });
});

// Test to cover
