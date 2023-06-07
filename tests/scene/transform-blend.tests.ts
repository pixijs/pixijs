import { BLEND_MODES } from '../../src/rendering/renderers/shared/state/const';
import { Container } from '../../src/rendering/scene/Container';
import { updateLayerGroupTransforms } from '../../src/rendering/scene/utils/updateLayerGroupTransforms';

describe('Transform Blend Modes', () =>
{
    it('should not cause a rebuild if blend mode is changed on a layer', async () =>
    {
        const root = new Container({ layer: true });

        root.layerGroup.structureDidChange = false;

        root.blendMode = BLEND_MODES.ADD;

        expect(root.layerGroup.structureDidChange).toEqual(false);
    });

    it('should cause a rebuild if blend mode is changed on a child', async () =>
    {
        const root = new Container({ layer: true });

        root.layerGroup.structureDidChange = false;

        const child = new Container();

        root.addChild(child);

        child.blendMode = BLEND_MODES.ADD;

        expect(root.layerGroup.structureDidChange).toEqual(true);
    });

    it('should inherit blend modes on the scene graph', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child' });

        root.addChild(container);

        container.addChild(child);

        container.blendMode = BLEND_MODES.ADD;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerBlendMode).toEqual(BLEND_MODES.ADD);
    });

    it('should inherit blend modes when children swapped around on the scene graph', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container' });
        const containerAdd = new Container({ label: 'containerAdd' });

        const child = new Container({ label: 'child' });

        root.addChild(container);
        root.addChild(containerAdd);

        container.addChild(child);

        containerAdd.blendMode = BLEND_MODES.ADD;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerBlendMode).toEqual(BLEND_MODES.NORMAL);

        containerAdd.addChild(child);

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.layerBlendMode).toEqual(BLEND_MODES.ADD);
    });
});

// Test to cover
