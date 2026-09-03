import { getWebGLRenderer } from '@test-utils';
import { Container, Graphics } from '~/scene';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

// drawImage into a scratch canvas works for 2d-presented (back-buffer) canvases
function readPixel(canvas: HTMLCanvasElement, x: number, y: number)
{
    const scratch = createCanvas(canvas.width, canvas.height);
    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

function fillContainer(width: number, height: number, color: number)
{
    const container = new Container();
    const graphics = new Graphics().rect(0, 0, width, height).fill(color);

    container.addChild(graphics);

    return container;
}

describe('MultiView back buffer resize (WebGL)', () =>
{
    it('grows the shared context canvas when a secondary view is resized larger after first render', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 64,
            height: 64,
            multiView: true,
            useBackBuffer: true,
            background: 0x00ff00,
        });

        // a secondary canvas smaller than its eventual size; the first render binds it at 32x32,
        // sizing both the cached render target and the shared context canvas to 32 wide
        const secondary = createCanvas(32, 32);

        renderer.render({ container: fillContainer(32, 32, 0xff0000), target: secondary });

        // grow the view: resize the DOM canvas and its cached CanvasSource so the render target
        // and the back-buffer texture both report the new 128x128 size
        secondary.width = 128;
        secondary.height = 128;

        const source = renderer.renderTarget.getRenderTarget(secondary).colorTexture.source;

        source.resize(128, 128, 1);

        renderer.render({ container: fillContainer(128, 128, 0x0000ff), target: secondary });

        // a far corner only exists if the shared context canvas grew to fit the resized view.
        // before the fix the back buffer swaps the target before RenderTargetSystem.renderStart,
        // so the GL adaptor's prerender never grows the context canvas and this corner is clipped
        // (left at the old 32-wide buffer, reading the green background or unrendered).
        expect(readPixel(secondary, 120, 120)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });
});
