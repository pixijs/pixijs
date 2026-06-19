import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { RenderTexture } from '~/rendering';
import { Container } from '~/scene';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

// drawImage into a scratch canvas works for 2d-presented and webgpu canvases alike
function readPixel(canvas: HTMLCanvasElement, x: number, y: number)
{
    const scratch = createCanvas(canvas.width, canvas.height);
    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

describe('MultiView rendering', () =>
{
    it('should cache the render target for a raw canvas across lookups', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const first = renderer.renderTarget.getRenderTarget(canvas);
        const second = renderer.renderTarget.getRenderTarget(canvas);

        expect(first).toBe(second);

        renderer.destroy();
    });

    it('should not create new render targets on repeated renders to a canvas', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();
        const container = new Container();

        renderer.render({ container, target: canvas });

        const target = renderer.renderTarget.getRenderTarget(canvas);
        const listenerCount = target.colorTexture.source.listenerCount('resize');

        renderer.render({ container, target: canvas });
        renderer.render({ container, target: canvas });

        expect(renderer.renderTarget.getRenderTarget(canvas)).toBe(target);
        expect(target.colorTexture.source.listenerCount('resize')).toBe(listenerCount);

        renderer.destroy();
    });

    it('should resolve the main canvas to the view render target', async () =>
    {
        const renderer = await getWebGLRenderer({});

        expect(renderer.renderTarget.getRenderTarget(renderer.canvas)).toBe(renderer.view.renderTarget);

        renderer.destroy();
    });

    it('should update lastObjectRendered when the main canvas is passed as a raw target', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const container = new Container();

        renderer.render({ container, target: renderer.canvas });

        expect(renderer.lastObjectRendered).toBe(container);

        renderer.destroy();
    });

    it('should clear target canvases with the renderer background color', async () =>
    {
        const renderer = await getWebGLRenderer({
            multiView: true,
            background: 0xff0000,
        });

        const canvas = createCanvas(8, 8);

        renderer.render({ container: new Container(), target: canvas });

        expect(readPixel(canvas, 4, 4)).toEqual([255, 0, 0, 255]);

        renderer.destroy();
    });

    it('should present renderer.clear({ target }) to the canvas', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas(8, 8);

        renderer.clear({ target: canvas, clearColor: [0, 0, 1, 1] });

        expect(readPixel(canvas, 4, 4)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });

    it('should not throw when clearing a fresh renderer with no target', async () =>
    {
        const renderer = await getWebGLRenderer({});

        expect(() => renderer.clear()).not.toThrow();

        renderer.destroy();
    });

    it('should clear a canvas target even when a texture target is bound', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas(8, 8);
        const texture = RenderTexture.create({ width: 8, height: 8 });

        // bind a framebuffer-backed target first; the clear must still land on the canvas
        renderer.render({ container: new Container(), target: texture });
        renderer.clear({ target: canvas, clearColor: [1, 0, 0, 1] });

        expect(readPixel(canvas, 4, 4)).toEqual([255, 0, 0, 255]);

        renderer.destroy();
    });

    it('should destroy implicitly created canvas sources on renderer destroy', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        renderer.render({ container: new Container(), target: canvas });

        const source = renderer.renderTarget.getRenderTarget(canvas).colorTexture;

        renderer.destroy();

        expect(source.destroyed).toBe(true);
    });

    it('should grow the context canvas per-axis without shrinking', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 800,
            height: 600,
            multiView: true,
        });

        renderer.context.ensureCanvasSize(createCanvas(400, 1000));

        expect(renderer.context.canvas.width).toBe(800);
        expect(renderer.context.canvas.height).toBe(1000);

        renderer.destroy();
    });

    it('should disable multiView when a user context is supplied', async () =>
    {
        const contextCanvas = createCanvas();
        const context = contextCanvas.getContext('webgl2');

        const renderer = await getWebGLRenderer({
            canvas: contextCanvas,
            context,
            multiView: true,
        });

        expect(renderer.context.multiView).toBe(false);

        // rendering must not attempt the multiView canvas copy
        expect(() => renderer.render({ container: new Container() })).not.toThrow();

        renderer.destroy();
    });

    it('should render different scenes to multiple canvases', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            background: 0x00ff00,
        });

        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);

        renderer.render({ container: new Container(), target: canvasA });
        renderer.render({ container: new Container(), target: canvasB, clearColor: [0, 0, 1, 1] });

        expect(readPixel(canvasA, 8, 8)).toEqual([0, 255, 0, 255]);
        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });
});

describe('MultiView rendering (WebGPU)', () =>
{
    itLocalOnly('should render different scenes to multiple canvases without any option', async () =>
    {
        const renderer = await getWebGPURenderer({
            width: 16,
            height: 16,
            background: 0x00ff00,
        });

        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);

        renderer.render({ container: new Container(), target: canvasA });
        renderer.render({ container: new Container(), target: canvasB, clearColor: [0, 0, 1, 1] });

        expect(readPixel(canvasA, 8, 8)).toEqual([0, 255, 0, 255]);
        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });

    itLocalOnly('should cache the render target for a raw canvas across renders', async () =>
    {
        const renderer = await getWebGPURenderer({});
        const canvas = createCanvas();
        const container = new Container();

        renderer.render({ container, target: canvas });

        const target = renderer.renderTarget.getRenderTarget(canvas);

        renderer.render({ container, target: canvas });

        expect(renderer.renderTarget.getRenderTarget(canvas)).toBe(target);

        renderer.destroy();
    });

    itLocalOnly('should register event views for added canvases', async () =>
    {
        const renderer = await getWebGPURenderer({});
        const canvas = createCanvas();

        document.body.appendChild(canvas);

        renderer.addView({ canvas });

        expect(renderer.events['_views'].get(canvas)).toBeDefined();

        renderer.destroy();
        canvas.remove();
    });
});
