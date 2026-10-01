import { Container } from '../container/Container';
import { Graphics } from '../graphics/shared/Graphics';
import { Particle } from '../particle-container/shared/Particle';
import { ParticleContainer } from '../particle-container/shared/ParticleContainer';
import { Sprite } from '../sprite/Sprite';
import { TilingSprite } from '../sprite-tiling/TilingSprite';
import { Text } from '../text/Text';
import { HTMLText } from '../text-html/HTMLText';
import '../graphics/init';
import '../particle-container/init';
import '../sprite-tiling/init';
import '../text/init';
import '../text-html/init';
import { getApp, getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Rectangle } from '~/maths/shapes/Rectangle';
import { CanvasRenderer } from '~/rendering/renderers/canvas/CanvasRenderer';
import { ImageSource } from '~/rendering/renderers/shared/texture/sources/ImageSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';

import type { WebGLRenderer } from '~/rendering/renderers/gl/WebGLRenderer';
import type { Renderer } from '~/rendering/renderers/types';

// mirrors #12165: render a layer with one renderer, then move it to a stage rendered by a second renderer.
// `settle` awaits anything the node generates asynchronously after a render.
async function moveToSecondRenderer(node: Container, settle: (renderer: WebGLRenderer) => unknown = () => undefined)
{
    const layer = new Container();
    const stageA = new Container();
    const stageB = new Container();

    layer.addChild(node);
    stageA.addChild(layer);

    const rendererA = await getWebGLRenderer();

    rendererA.render(stageA);
    await settle(rendererA);

    const expected = rendererA.extract.pixels(stageA).pixels;

    stageA.removeChild(layer);
    stageB.addChild(layer);

    const rendererB = await getWebGLRenderer();

    rendererB.render(stageB);
    await settle(rendererB);

    const actual = rendererB.extract.pixels(stageB).pixels;

    rendererA.destroy();
    rendererB.destroy();

    return { expected, actual };
}

describe('rendering a container with a second renderer', () =>
{
    it('should render a sprite', async () =>
    {
        const sprite = new Sprite({ texture: Texture.WHITE, width: 16, height: 16 });
        const { expected, actual } = await moveToSecondRenderer(sprite);

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a text', async () =>
    {
        const { expected, actual } = await moveToSecondRenderer(new Text({ text: 'hello', style: { fill: 'white' } }));

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a graphics', async () =>
    {
        const { expected, actual } = await moveToSecondRenderer(new Graphics().rect(0, 0, 16, 16).fill(0xff0000));

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a tiling sprite', async () =>
    {
        const { expected, actual } = await moveToSecondRenderer(
            new TilingSprite({ texture: Texture.WHITE, width: 16, height: 16 })
        );

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a tiling sprite that cannot batch', async () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 2;
        canvas.height = 1;

        const context = canvas.getContext('2d');

        context.fillStyle = 'white';
        context.fillRect(0, 0, 2, 1);

        // a frame smaller than its source cannot be batched, so the tiling sprite draws with its own shader
        const texture = new Texture({ source: new ImageSource({ resource: canvas }), frame: new Rectangle(0, 0, 1, 1) });
        const { expected, actual } = await moveToSecondRenderer(new TilingSprite({ texture, width: 16, height: 16 }));

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a particle container', async () =>
    {
        const container = new ParticleContainer({ texture: Texture.WHITE, boundsArea: new Rectangle(0, 0, 16, 16) });

        container.addParticle(new Particle({ texture: Texture.WHITE, scaleX: 16, scaleY: 16 }));

        const { expected, actual } = await moveToSecondRenderer(container);

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render an html text', async () =>
    {
        const text = new HTMLText({ text: 'hello', style: { fill: 'white' } });
        const { expected, actual } = await moveToSecondRenderer(
            text,
            (renderer) => text._gpuData[renderer.uid].texturePromise
        );

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });
});

// render a stage with one renderer, destroy that renderer, then render the same stage with a new one.
async function renderAfterDestroy(
    stage: Container,
    createA: () => Promise<Renderer> = getWebGLRenderer,
    createB: () => Promise<Renderer> = createA,
)
{
    const rendererA = await createA();

    rendererA.render(stage);

    const expected = rendererA.extract.pixels(stage).pixels;

    rendererA.destroy();

    const rendererB = await createB();

    rendererB.render(stage);

    const actual = rendererB.extract.pixels(stage).pixels;

    rendererB.destroy();

    return { expected, actual };
}

describe('rendering the same stage after its renderer is destroyed', () =>
{
    it('should render a sprite', async () =>
    {
        const stage = new Container();

        stage.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16 }));

        const { expected, actual } = await renderAfterDestroy(stage);

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a nested render group', async () =>
    {
        const stage = new Container();
        const group = new Container({ isRenderGroup: true });

        group.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16 }));
        stage.addChild(group);

        const { expected, actual } = await renderAfterDestroy(stage);

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a container cached as a texture', async () =>
    {
        const stage = new Container();
        const cached = new Container();

        cached.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16 }));
        cached.cacheAsTexture(true);
        stage.addChild(cached);

        const { expected, actual } = await renderAfterDestroy(stage);

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    itLocalOnly('should render a sprite with WebGPU', async () =>
    {
        const stage = new Container();

        stage.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16 }));

        const { expected, actual } = await renderAfterDestroy(stage, getWebGPURenderer);

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    itLocalOnly('should render a sprite with WebGPU after WebGL', async () =>
    {
        const stage = new Container();

        stage.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16 }));

        const { expected, actual } = await renderAfterDestroy(stage, getWebGLRenderer, getWebGPURenderer);

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a sprite with the canvas renderer after WebGL', async () =>
    {
        const stage = new Container();

        stage.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16 }));

        const { expected, actual } = await renderAfterDestroy(stage, getWebGLRenderer, async () =>
        {
            const renderer = new CanvasRenderer();

            await renderer.init({ width: 100, height: 100 });

            return renderer;
        });

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });
});

describe('rendering the content of a destroyed application with a new one', () =>
{
    it('should render a nested render group and a cached container', async () =>
    {
        const node = new Container();
        const group = new Container({ isRenderGroup: true });
        const cached = new Container();

        group.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16 }));
        cached.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16, x: 16 }));
        cached.cacheAsTexture(true);
        node.addChild(group, cached);

        const first = await getApp({ preference: 'webgl' });

        first.stage.addChild(node);
        first.render();

        const expected = first.renderer.extract.pixels(first.stage).pixels;

        first.destroy();

        const second = await getApp({ preference: 'webgl' });

        second.stage.addChild(node);
        second.render();

        const actual = second.renderer.extract.pixels(second.stage).pixels;

        second.destroy(false, { children: true });

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });
});

describe('rendering the same stage with two live renderers', () =>
{
    it('should render a text', async () =>
    {
        const stage = new Container();

        stage.addChild(new Text({ text: 'hello', style: { fill: 'white' } }));

        const rendererA = await getWebGLRenderer();
        const rendererB = await getWebGLRenderer();

        rendererA.render(stage);

        const expected = rendererA.extract.pixels(stage).pixels;

        rendererB.render(stage);

        const actual = rendererB.extract.pixels(stage).pixels;

        rendererA.destroy();
        rendererB.destroy();

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should render a sprite that moves', async () =>
    {
        const stage = new Container();
        const sprite = new Sprite({ texture: Texture.WHITE, width: 16, height: 16 });
        const frame = new Rectangle(0, 0, 32, 16);

        stage.addChild(sprite);

        const rendererA = await getWebGLRenderer();
        const rendererB = await getWebGLRenderer();

        rendererA.render(stage);
        rendererB.render(stage);

        sprite.x = 8;

        rendererB.render(stage);

        const actual = rendererB.extract.pixels({ target: stage, frame }).pixels;

        rendererA.render(stage);

        const expected = rendererA.extract.pixels({ target: stage, frame }).pixels;

        rendererA.destroy();
        rendererB.destroy();

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });

    it('should keep rendering after the other renderer is destroyed', async () =>
    {
        const stage = new Container();

        stage.addChild(new Sprite({ texture: Texture.WHITE, width: 16, height: 16 }));

        const rendererA = await getWebGLRenderer();
        const rendererB = await getWebGLRenderer();

        rendererA.render(stage);
        rendererB.render(stage);

        const expected = rendererA.extract.pixels(stage).pixels;

        rendererA.destroy();

        rendererB.render(stage);

        const actual = rendererB.extract.pixels(stage).pixels;

        rendererB.destroy();

        expect(expected.some((value) => value > 0)).toBe(true);
        expect(actual).toEqual(expected);
    });
});
