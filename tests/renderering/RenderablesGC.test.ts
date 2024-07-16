import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';
import { Container } from '../../src/scene/container/Container';
import { Graphics } from '../../src/scene/graphics/shared/Graphics';
import { Mesh } from '../../src/scene/mesh/shared/Mesh';
import { MeshGeometry } from '../../src/scene/mesh/shared/MeshGeometry';
import { Sprite } from '../../src/scene/sprite/Sprite';
import { NineSliceSprite } from '../../src/scene/sprite-nine-slice/NineSliceSprite';
import { TilingSprite } from '../../src/scene/sprite-tiling/TilingSprite';
import { Text } from '../../src/scene/text/Text';
import { BitmapText } from '../../src/scene/text-bitmap/BitmapText';
import { HTMLText } from '../../src/scene/text-html/HTMLText';
import { getWebGLRenderer } from '../utils/getRenderer';

describe('RenderableGC', () =>
{
    it('should gc correctly', async () =>
    {
        const renderer = await getWebGLRenderer({
            renderablesGCMaxUnusedTime: 5,
            renderableGCFrequency: 10,
        });

        const container = new Container();

        const sprite = new Sprite(Texture.WHITE);

        container.addChild(sprite);

        renderer.render(container);

        expect(renderer.renderableGC['_managedRenderables'].length).toEqual(1);

        await new Promise((resolve) =>
        {
            setTimeout(resolve, 1000);
        });

        expect(sprite.listenerCount('destroyed')).toEqual(1);

        container.removeChild(sprite);

        renderer.render(container);

        expect(renderer.renderableGC['_managedRenderables'].length).toEqual(1);

        await new Promise((resolve) =>
        {
            setTimeout(resolve, 1000);
        });

        // should be cleaned up!
        expect(renderer.renderableGC['_managedRenderables'].length).toEqual(0);

        // check sprite.destroy event has now listeners..
        expect(sprite.listenerCount('destroyed')).toEqual(0);

        renderer.destroy();
    });

    it('should call destroy on all renderables that are gc', async () =>
    {
        const renderer = await getWebGLRenderer({
            renderablesGCMaxUnusedTime: 5,
            renderableGCFrequency: 10,
        });

        const container = new Container();

        const sprite = new Sprite(Texture.WHITE);
        const tilingSprite = new TilingSprite(Texture.WHITE);
        const graphics = new Graphics().rect(0, 0, 100, 100).fill('red');
        const mesh = new Mesh({
            geometry: new MeshGeometry({
                positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
                uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
                indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
            }),
            texture: Texture.WHITE,
        });
        const nineSliceSprite = new NineSliceSprite({
            texture: Texture.WHITE
        });
        const text = new Text({
            text: 'Hello World',
            style: { fill: 'black' }
        });
        const htmlText = new HTMLText({
            text: 'Hello World',
            style: { fill: 'black' }
        });
        const bitmapText = new BitmapText({
            text: 'Hello World',
            style: { fill: 'black' }
        });

        container.addChild(sprite);
        container.addChild(tilingSprite);
        container.addChild(graphics);
        container.addChild(mesh);
        container.addChild(nineSliceSprite);
        container.addChild(text);
        container.addChild(htmlText);
        container.addChild(bitmapText);

        renderer.render(container);

        expect(sprite.listenerCount('destroyed')).toEqual(1);
        expect(tilingSprite.listenerCount('destroyed')).toEqual(1);
        expect(graphics.listenerCount('destroyed')).toEqual(1);
        expect(mesh.listenerCount('destroyed')).toEqual(1);
        expect(nineSliceSprite.listenerCount('destroyed')).toEqual(1);
        expect(text.listenerCount('destroyed')).toEqual(1);
        expect(htmlText.listenerCount('destroyed')).toEqual(1);
        expect(bitmapText.listenerCount('destroyed')).toEqual(1);

        container.removeChild(sprite);
        container.removeChild(tilingSprite);
        container.removeChild(graphics);
        container.removeChild(mesh);
        container.removeChild(nineSliceSprite);
        container.removeChild(text);
        container.removeChild(htmlText);
        container.removeChild(bitmapText);

        renderer.render(container);

        await new Promise((resolve) =>
        {
            setTimeout(resolve, 1000);
        });

        // check sprite.destroy event has now listeners..
        expect(sprite.listenerCount('destroyed')).toEqual(0);
        expect(tilingSprite.listenerCount('destroyed')).toEqual(0);
        expect(graphics.listenerCount('destroyed')).toEqual(0);
        expect(mesh.listenerCount('destroyed')).toEqual(0);
        expect(nineSliceSprite.listenerCount('destroyed')).toEqual(0);
        expect(text.listenerCount('destroyed')).toEqual(0);
        expect(htmlText.listenerCount('destroyed')).toEqual(0);
        expect(bitmapText.listenerCount('destroyed')).toEqual(0);

        await new Promise((resolve) =>
        {
            setTimeout(resolve, 1000);
        });

        renderer.destroy();
    });
});

