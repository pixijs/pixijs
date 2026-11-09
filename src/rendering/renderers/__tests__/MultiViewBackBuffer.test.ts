import { getWebGLRenderer } from '@test-utils';
import { Container, Graphics } from '~/scene';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

// drawImage into a scratch canvas works for 2d-presented canvases
function readPixel(canvas: HTMLCanvasElement, x: number, y: number)
{
    const scratch = createCanvas(canvas.width, canvas.height);
    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

describe('MultiView back buffer (WebGL)', () =>
{
    it('presents the back-buffer frame to a secondary canvas', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            useBackBuffer: true,
            background: 0x00ff00,
        });

        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);

        renderer.render({ container: new Container(), target: canvasA });
        renderer.render({ container: new Container(), target: canvasB, clearColor: [0, 0, 1, 1] });

        // the secondary canvas must hold the resolved frame, not a blank surface
        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });

    it('presents real back-buffer content to a secondary canvas', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            useBackBuffer: true,
            background: 0x00ff00,
        });

        const canvasB = createCanvas(16, 16);

        const container = new Container();
        const graphics = new Graphics().rect(0, 0, 16, 16).fill(0xff0000);

        container.addChild(graphics);

        renderer.render({ container, target: canvasB, clearColor: [0, 0, 1, 1] });

        expect(readPixel(canvasB, 8, 8)).toEqual([255, 0, 0, 255]);

        renderer.destroy();
    });
});
