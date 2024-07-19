import { Sprite } from '../../src';
import { Container } from '../../src/scene/container/Container';
import { getWebGLRenderer } from '../utils/getRenderer';

describe('Renderable Containers', () =>
{
    it('should register a renderable update correctly in the render group', async () =>
    {
        const container = new Container({
            isRenderGroup: true,
        });

        const child = new Sprite();

        container.addChild(child);

        child.onViewUpdate();

        // the update should not be handled here.. as have had a structure rebuild..
        // and it will be handled inthe instruction generation loop
        expect(container.renderGroup.childrenRenderablesToUpdate).toEqual({
            list: [],
            index: 0,
        });

        const renderer = await getWebGLRenderer();

        renderer.render(container);

        child.onViewUpdate();

        expect(container.renderGroup.childrenRenderablesToUpdate).toEqual({
            list: [child],
            index: 1,
        });

        renderer.destroy();
    });

    it('should register a renderable update only once on the render group', async () =>
    {
        const container = new Container({
            isRenderGroup: true,
        });

        const child = new Sprite();

        container.addChild(child);

        const renderer = await getWebGLRenderer();

        renderer.render(container);

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
