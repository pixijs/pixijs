import { Application } from '../../src/app/Application';
import { Rectangle } from '../../src/maths/shapes/Rectangle';
import { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';
import { Container } from '../../src/scene/container/Container';
import { Graphics } from '../../src/scene/graphics/shared/Graphics';
import { Mesh } from '../../src/scene/mesh/shared/Mesh';
import { Sprite } from '../../src/scene/sprite/Sprite';
import { QuadGeometry } from '../../src/scene/sprite-tiling/QuadGeometry';
import { TilingSprite } from '../../src/scene/sprite-tiling/TilingSprite';
import { Text } from '../../src/scene/text/Text';

import type { GlGraphicsAdaptor } from '../../src/scene/graphics/gl/GlGraphicsAdaptor';

describe('Round Pixels', () =>
{
    it('Round pixels should set correctly when passed as an option', async () =>
    {
        const app = new Application();

        await app.init({
            roundPixels: true,
        });

        expect(app.renderer['_roundPixels']).toBe(1);
        expect(app.renderer.roundPixels).toBe(true);
    });

    it('Round pixels should set correctly when passed as an option to the renderer', async () =>
    {
        const renderer = new WebGLRenderer();

        await renderer.init({
            roundPixels: true,
        });

        expect(renderer.roundPixels).toBe(true);
        expect(renderer._roundPixels).toBe(1);

        const renderer2 = new WebGLRenderer();

        await renderer2.init({
            roundPixels: false,
        });

        expect(renderer2.roundPixels).toBe(false);
        expect(renderer2._roundPixels).toBe(0);
    });

    it('Round pixels correctly on a sprite', async () =>
    {
        const sprite = new Sprite();

        expect(sprite.view.roundPixels).toBe(0);

        sprite.roundPixels = true;

        expect(sprite.view.roundPixels).toBe(1);
    });

    it('Round pixels correctly on a mesh', async () =>
    {
        const mesh = new Mesh({
            geometry: new QuadGeometry(),
        });

        expect(mesh.view.roundPixels).toBe(0);

        mesh.roundPixels = true;

        expect(mesh.view.roundPixels).toBe(1);
    });

    it('Round pixels correctly on a graphics', async () =>
    {
        const graphics = new Graphics();

        expect(graphics.view.roundPixels).toBe(0);

        graphics.roundPixels = true;

        expect(graphics.view.roundPixels).toBe(1);
    });

    it('Round pixels correctly on a TilingSprite', async () =>
    {
        const tilingSprite = new TilingSprite();

        expect(tilingSprite.view.roundPixels).toBe(0);

        tilingSprite.roundPixels = true;

        expect(tilingSprite.view.roundPixels).toBe(1);
    });

    it('renderer round pixels should override batched items round pixels if false', async () =>
    {
        const renderer = new WebGLRenderer();

        await renderer.init({
            roundPixels: true,
        });

        const sprite = new Sprite();
        const tilingSprite = new TilingSprite();
        const graphics = new Graphics().rect(0, 0, 100, 100).fill('red');

        const mesh = new Mesh({
            geometry: new QuadGeometry(),
        });

        const container = new Container();

        container.addChild(tilingSprite, graphics, mesh, sprite);

        renderer.render(container);

        const batchableSprite = renderer.renderPipes.sprite['_getGpuSprite'](sprite);

        expect(batchableSprite.roundPixels).toBe(1);

        const batchableGraphics = renderer.renderPipes.graphics['_getBatchesForRenderable'](graphics);

        expect(batchableGraphics[0].roundPixels).toBe(1);

        const batchableMesh = renderer.renderPipes.mesh['_getBatchableMesh'](mesh);

        expect(batchableMesh.roundPixels).toBe(1);

        const batchableTilingSprite = renderer.renderPipes.tilingSprite['_getBatchedTilingSprite'](tilingSprite);

        expect(batchableTilingSprite.view.roundPixels).toBe(1);
    });

    it('renderer round pixels should override text items round pixels if false', async () =>
    {
        const renderer = new WebGLRenderer();

        await renderer.init({
            roundPixels: true,
        });

        const text = new Text({ text: 'hello world' });
        const textHTML = new Text({
            text: 'hello world',
            renderMode: 'html'
        });

        const batchableTextData = renderer.renderPipes.text['_getGpuText'](text);

        expect(batchableTextData.batchableSprite.roundPixels).toBe(1);

        const batchableTextHTMLData = renderer.renderPipes.htmlText['_getGpuText'](textHTML);

        expect(batchableTextHTMLData.batchableSprite.roundPixels).toBe(1);
    });

    it('renderer round pixels should override non batched items round pixels if false', async () =>
    {
        const renderer = new WebGLRenderer();

        await renderer.init({
            roundPixels: true,
        });

        const nonBatchableTexture = new Texture({
            frame: new Rectangle(0, 0, 0.5, 0.5),
            source: Texture.WHITE.source,
        });

        const tilingSprite = new TilingSprite({
            texture: nonBatchableTexture
        });

        const graphics = new Graphics().rect(0, 0, 100, 100).fill('red');

        graphics.context.batchMode = 'no-batch';

        const container = new Container();

        container.addChild(tilingSprite, graphics);

        renderer.render(container);

        // this is a brutal line, but we want to dig in and see that the uniform was set correctly!
        // eslint-disable-next-line max-len
        expect((renderer.renderPipes.graphics['_adaptor'] as GlGraphicsAdaptor)['shader'].resources.localUniforms.uniforms.uRound).toBe(1);

        // this test covers mesh and tiling sprite (as mesh is used under the hood)
        expect(renderer.renderPipes.mesh.localUniforms.uniforms.uRound).toBe(1);
    });
});
