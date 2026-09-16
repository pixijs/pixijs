import { Container } from '../../container/Container';
import { NineSliceSprite } from '../NineSliceSprite';
import '../init';
import { CanvasRenderer, ImageSource, Texture } from '~/rendering';

type Rgba = [number, number, number, number];

const RED: Rgba = [255, 0, 0, 255];
const GREEN: Rgba = [0, 255, 0, 255];
const BLUE: Rgba = [0, 0, 255, 255];
const YELLOW: Rgba = [255, 255, 0, 255];
const CLEAR: Rgba = [0, 0, 0, 0];

/**
 * Four solid quadrants: red | green over blue | yellow.
 * @param size - Width and height of the square texture in pixels.
 */
function makeQuadrantTexture(size: number): Texture
{
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const half = size / 2;

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, half, half);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(half, 0, half, half);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, half, half, half);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(half, half, half, half);

    return new Texture({ source: new ImageSource({ resource: canvas }) });
}

async function renderToCanvas(sprite: NineSliceSprite, size = 128)
{
    const renderer = new CanvasRenderer();

    await renderer.init({ width: size, height: size, backgroundAlpha: 0 });

    const container = new Container();

    container.addChild(sprite);
    renderer.render({ container });

    const ctx = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;
    const pixel = (x: number, y: number): Rgba => Array.from(ctx.getImageData(x, y, 1, 1).data) as Rgba;

    return { pixel, destroy: () => renderer.destroy() };
}

describe('CanvasNineSliceSpritePipe', () =>
{
    it('should render the stretched centre when the borders cover the whole texture', async () =>
    {
        // 60px texture with 30px borders: the centre source span is 0 wide and 0 tall.
        // Rendered at 128px the corners are 30px and the centre cells are 68px.
        const sprite = new NineSliceSprite({
            texture: makeQuadrantTexture(60),
            leftWidth: 30,
            rightWidth: 30,
            topHeight: 30,
            bottomHeight: 30,
            width: 128,
            height: 128,
        });

        const { pixel, destroy } = await renderToCanvas(sprite);

        expect(pixel(10, 10)).toEqual(RED);
        expect(pixel(118, 10)).toEqual(GREEN);
        expect(pixel(10, 118)).toEqual(BLUE);
        expect(pixel(118, 118)).toEqual(YELLOW);

        // Centre column, centre row and centre cell must be filled from the seam, not left empty.
        expect(pixel(64, 10)[3]).toBe(255);
        expect(pixel(10, 64)[3]).toBe(255);
        expect(pixel(64, 64)[3]).toBe(255);

        destroy();
    });

    it('should render the stretched centre when the borders exceed the texture', async () =>
    {
        const sprite = new NineSliceSprite({
            texture: makeQuadrantTexture(60),
            leftWidth: 40,
            rightWidth: 40,
            topHeight: 40,
            bottomHeight: 40,
            width: 128,
            height: 128,
        });

        const { pixel, destroy } = await renderToCanvas(sprite);

        expect(pixel(64, 10)[3]).toBe(255);
        expect(pixel(10, 64)[3]).toBe(255);
        expect(pixel(64, 64)[3]).toBe(255);

        destroy();
    });

    it('should draw nothing and not throw for a zero or negative size', async () =>
    {
        for (const size of [0, -50])
        {
            const sprite = new NineSliceSprite({
                texture: makeQuadrantTexture(60),
                leftWidth: 10,
                rightWidth: 10,
                topHeight: 10,
                bottomHeight: 10,
                width: size,
                height: size,
            });

            const { pixel, destroy } = await renderToCanvas(sprite);

            expect(pixel(0, 0)).toEqual(CLEAR);
            expect(pixel(5, 5)).toEqual(CLEAR);

            destroy();
        }
    });
});
