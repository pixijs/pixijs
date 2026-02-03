import { Container } from '../Container';
import { DummyView } from './DummyView';

describe('Renderable Containers', () =>
{
    it('should register a renderable update correctly in the render group', async () =>
    {
        const container = new Container({
            isRenderGroup: true,
        });

        const child = new DummyView();

        container.addChild(child);

        child.onViewUpdate();

        expect(container.renderGroup.childrenRenderablesToUpdate).toEqual({
            list: [child],
            index: 1,
        });
    });

    it('should register a renderable update only once on the render group', async () =>
    {
        const container = new Container({
            isRenderGroup: true,
        });

        const child = new DummyView();

        container.addChild(child);

        // updateLayerGroupTransforms(container.layerGroup);

        child.onViewUpdate();

        expect(container.renderGroup.childrenRenderablesToUpdate).toEqual({
            list: [child],
            index: 1,
        });

        child.onViewUpdate();

        expect(container.renderGroup.childrenRenderablesToUpdate).toEqual({
            list: [child],
            index: 1,
        });
    });
});
