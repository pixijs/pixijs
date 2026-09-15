import { Container } from '../container/Container';
import { Graphics } from '../graphics/shared/Graphics';
import { Sprite } from '../sprite/Sprite';
import { Text } from '../text/Text';
import { HTMLText } from '../text-html/HTMLText';
import '../graphics/init';
import '../text/init';
import '../text-html/init';
import { getWebGLRenderer } from '@test-utils';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';

import type { WebGLRenderer } from '~/rendering/renderers/gl/WebGLRenderer';

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
