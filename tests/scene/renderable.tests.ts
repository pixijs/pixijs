import { Container } from '../../src/rendering/scene/Container';
import { DummyView } from './DummyView';

describe('Renderable Containers', () =>
{
    it('should register a renderable update correctly in the layer group', async () =>
    {
        const container = new Container({
            layer: true,
        });

        const child = new Container({
            view: new DummyView()
        });

        container.addChild(child);

        child.onViewUpdate();

        expect(container.layerGroup.childrenRenderablesToUpdate).toEqual({
            list: [child],
            index: 1,
        });
    });

    it('should register a renderable update only once on the layer group', async () =>
    {
        const container = new Container({
            layer: true,
        });

        const child = new Container({
            view: new DummyView()
        });

        container.addChild(child);

        // updateLayerGroupTransforms(container.layerGroup);

        child.onViewUpdate();

        expect(container.layerGroup.childrenRenderablesToUpdate).toEqual({
            list: [child],
            index: 1,
        });

        child.onViewUpdate();

        expect(container.layerGroup.childrenRenderablesToUpdate).toEqual({
            list: [child],
            index: 1,
        });
    });
});
