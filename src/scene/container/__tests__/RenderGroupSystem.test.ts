import '~/rendering/renderers/shared/texture/Texture';
import { Container } from '../Container';
import '../../text/init';
import { getWebGLRenderer } from '@test-utils';
import { TexturePool } from '~/rendering/renderers/shared/texture/TexturePool';
import { Graphics, Text } from '~/scene';

describe('RenderGroupSystem', () =>
{
    it('should reset childrenRenderablesToUpdate index between renders', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: true });
        const text = new Text({ text: 'hello world' });

        container.addChild(text);

        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(0);

        renderer.render(container);

        text.text = 'hello world 2';
        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(1);

        renderer.render(container);

        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(0);
    });

    it('should only call on render once for a render group after conversion', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: false, label: 'root' });

        const child = new Container({ isRenderGroup: true, label: 'child' });

        container.addChild(child);

        child.onRender = jest.fn();

        renderer.render(container);

        expect(child.onRender).toHaveBeenCalledTimes(1);
    });

    it('should only call on render once for a render group before conversion', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: true, label: 'root' });

        const child = new Container({ isRenderGroup: true, label: 'child' });

        container.addChild(child);

        child.onRender = jest.fn();

        renderer.render(container);

        expect(child.onRender).toHaveBeenCalledTimes(1);
    });

    it('should correctly set scaleMode for render group texture source during rendering', async () =>
    {
        const renderer = await getWebGLRenderer();
        const container = new Container();

        container.cacheAsTexture({ scaleMode: 'nearest' });
        renderer.render(container);

        expect(container.renderGroup.texture._source.scaleMode).toEqual('nearest');
    });

    it('should defer refreshing a cached render group while it is culled', async () =>
    {
        const renderer = await getWebGLRenderer();
        const stage = new Container();
        const cached = new Container();

        cached.addChild(new Graphics().rect(0, 0, 20, 20).fill(0xffffff));
        cached.cacheAsTexture(true);
        stage.addChild(cached);

        renderer.render(stage);

        cached.culled = true;
        cached.updateCacheTexture();

        const prepareTexture = jest.spyOn(TexturePool, 'getOptimalTexture');

        try
        {
            renderer.render(stage);
            renderer.render(stage);

            expect(prepareTexture).not.toHaveBeenCalled();
            expect(cached.renderGroup.textureNeedsUpdate).toBe(true);

            cached.culled = false;
            renderer.render(stage);

            expect(prepareTexture).toHaveBeenCalledTimes(1);
            expect(cached.renderGroup.textureNeedsUpdate).toBe(false);
        }
        finally
        {
            prepareTexture.mockRestore();
            renderer.destroy();
        }
    });
});
