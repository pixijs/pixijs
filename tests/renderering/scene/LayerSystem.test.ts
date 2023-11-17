import { Container } from '../../../src/scene/container/Container';
import { Text } from '../../../src/scene/text/Text';
import { getRenderer } from '../../utils/getRenderer';
import '../../../src/rendering/renderers/shared/texture/Texture';

describe('LayerSystem', () =>
{
    it('should reset childrenRenderablesToUpdate index between renders', async () =>
    {
        const renderer = await getRenderer();

        const container = new Container({ layer: true });
        const text = new Text({ text: 'hello world' });

        container.addChild(text);

        expect(container.layerGroup.childrenRenderablesToUpdate.index).toEqual(0);

        text.text = 'hello world 2';

        expect(container.layerGroup.childrenRenderablesToUpdate.index).toEqual(1);

        renderer.render(container);

        expect(container.layerGroup.childrenRenderablesToUpdate.index).toEqual(0);
    });
});
