import { DashLineShader } from '../shared/DashLineShader';
import { SmoothGraphics } from '../shared/SmoothGraphics';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { CanvasRenderer, Texture } from '~/rendering';
import { Container, Graphics, GraphicsContext } from '~/scene';

import type { Renderer } from '~/rendering';

/**
 * Renders the content over an opaque black 100x100 background
 * @param renderer - The renderer
 * @param content - What to render
 * @returns The RGBA pixels
 */
function renderPixels(renderer: Renderer, content: Container): Uint8ClampedArray | Uint8Array
{
    const stage = new Container();
    const background = new Graphics().rect(0, 0, 100, 100).fill(0x000000);

    stage.addChild(background, content);

    const { pixels } = renderer.extract.pixels({ target: stage });

    stage.removeChild(content);
    stage.destroy({ children: true });

    return pixels;
}

function getPixel(renderer: Renderer, content: Container, x: number, y: number): number[]
{
    const i = ((y * 100) + x) * 4;

    return [...renderPixels(renderer, content).slice(i, i + 4)];
}

function getRedChannel(renderer: Renderer, content: Container): number[]
{
    const pixels = Array.from(renderPixels(renderer, content));

    return pixels.filter((_value, i) => i % 4 === 0);
}

describe('SmoothGraphics', () =>
{
    it('should be a Graphics with its own render pipe', () =>
    {
        const graphics = new SmoothGraphics();

        expect(graphics).toBeInstanceOf(Graphics);
        expect(graphics.renderPipeId).toBe('smoothGraphics');
        expect(graphics.label).toBe('SmoothGraphics');
        expect(new SmoothGraphics({ label: 'mine' }).label).toBe('mine');
    });

    it('should clone into a SmoothGraphics sharing the context', () =>
    {
        const graphics = new SmoothGraphics().rect(0, 0, 10, 10).fill(0xff0000);
        const clone = graphics.clone();
        const deepClone = graphics.clone(true);

        expect(clone).toBeInstanceOf(SmoothGraphics);
        expect(clone.context).toBe(graphics.context);
        expect(deepClone).toBeInstanceOf(SmoothGraphics);
        expect(deepClone.context).not.toBe(graphics.context);

        // the shared context outlives the original
        graphics.destroy();
        expect(clone.context.destroyed).toBe(false);

        clone.destroy();
        deepClone.destroy();
    });

    const rendererTests = (getRenderer: () => Promise<Renderer>) =>
    {
        let renderer: Renderer;

        beforeEach(async () =>
        {
            renderer = await getRenderer();
        });

        afterEach(() =>
        {
            renderer.destroy();
            renderer = null;
        });

        it.each(['batch', 'no-batch'] as const)('should draw fills and strokes (%s)', (batchMode) =>
        {
            const graphics = new SmoothGraphics();

            graphics.context.batchMode = batchMode;
            graphics.rect(10, 10, 30, 30).fill(0xff0000);
            graphics.moveTo(60, 20).lineTo(90, 20).stroke({ width: 6, color: 0x00ff00 });

            expect(getPixel(renderer, graphics, 25, 25)).toEqual([255, 0, 0, 255]);
            expect(getPixel(renderer, graphics, 75, 20)).toEqual([0, 255, 0, 255]);

            graphics.destroy();
        });

        it('should anti-alias edges without MSAA', () =>
        {
            const smooth = new SmoothGraphics().circle(50.3, 50.3, 30).fill(0xffffff);
            const aliased = new Graphics().circle(50.3, 50.3, 30).fill(0xffffff);

            const isPartial = (value: number) => value > 10 && value < 245;

            expect(getRedChannel(renderer, smooth).filter(isPartial).length).toBeGreaterThan(50);
            expect(getRedChannel(renderer, aliased).filter(isPartial).length).toBe(0);
        });

        it('should apply alpha once whether the context is batched or not', () =>
        {
            const batched = new SmoothGraphics().rect(0, 0, 100, 100).fill(0xffffff);
            const notBatched = new SmoothGraphics().rect(0, 0, 100, 100).fill(0xffffff);

            notBatched.context.batchMode = 'no-batch';
            batched.alpha = notBatched.alpha = 0.5;

            const batchedValue = getRedChannel(renderer, batched)[(50 * 100) + 50];
            const notBatchedValue = getRedChannel(renderer, notBatched)[(50 * 100) + 50];

            expect(Math.abs(batchedValue - 128)).toBeLessThanOrEqual(1);
            expect(Math.abs(notBatchedValue - 128)).toBeLessThanOrEqual(1);
        });

        it('should draw a context that the regular context system set up first', () =>
        {
            const graphics = new SmoothGraphics().rect(0, 0, 40, 40).fill(0xff0000);

            // renderer.prepare does this for every Graphics, including a SmoothGraphics
            renderer.graphicsContext.getGpuContext(graphics.context);

            expect(getPixel(renderer, graphics, 20, 20)).toEqual([255, 0, 0, 255]);

            graphics.destroy();
        });

        it('should draw textured fills next to plain ones', () =>
        {
            const graphics = new SmoothGraphics();

            graphics.context.batchMode = 'no-batch';
            graphics.rect(10, 10, 30, 30).fill(0x0000ff);
            graphics.rect(60, 10, 30, 30).fill({ texture: Texture.WHITE, color: 0x00ff00 });
            graphics.texture(Texture.WHITE, 0xff0000, 10, 60, 30, 30);

            expect(getPixel(renderer, graphics, 25, 25)).toEqual([0, 0, 255, 255]);
            expect(getPixel(renderer, graphics, 75, 25)).toEqual([0, 255, 0, 255]);
            expect(getPixel(renderer, graphics, 25, 75)).toEqual([255, 0, 0, 255]);

            graphics.destroy();
        });

        it('should hide the gaps of dashed strokes', () =>
        {
            const graphics = new SmoothGraphics();

            graphics.context.customShader = new DashLineShader({ dash: 10, gap: 10 });
            graphics.moveTo(0, 50).lineTo(100, 50).stroke({ width: 6, color: 0xffffff });
            graphics.rect(0, 0, 20, 20).fill(0xffffff);

            const red = getRedChannel(renderer, graphics);

            // dashes start at x = 0, so x = 5 is in a dash and x = 15 in a gap
            expect(red[(50 * 100) + 5]).toBe(255);
            expect(red[(50 * 100) + 15]).toBe(0);
            // fills aren't drawn by the dash shader
            expect(red[(10 * 100) + 10]).toBe(0);

            graphics.context.customShader.destroy();
            graphics.destroy();
        });

        it('should render after the context is destroyed and replaced', () =>
        {
            const graphics = new SmoothGraphics().rect(0, 0, 40, 40).fill(0xff0000);

            renderer.render(graphics);

            graphics.context.destroy();
            graphics.context = new GraphicsContext().rect(0, 0, 40, 40).fill(0x00ff00);

            expect(getPixel(renderer, graphics, 20, 20)).toEqual([0, 255, 0, 255]);

            graphics.destroy(true);
        });
    };

    describe('WebGL', () =>
    {
        rendererTests(() => getWebGLRenderer({ antialias: false }));
    });

    describeLocalOnly('WebGPU', () =>
    {
        rendererTests(() => getWebGPURenderer({ antialias: false }));
    });

    it('should draw like a Graphics on the canvas renderer', async () =>
    {
        const renderer = new CanvasRenderer();

        await renderer.init({ width: 10, height: 10, backgroundAlpha: 0 });

        const graphics = new SmoothGraphics().rect(0, 0, 10, 10).fill(0xff0000);

        renderer.render({ container: graphics });

        const context = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;
        const pixel = context.getImageData(5, 5, 1, 1).data;

        expect([...pixel]).toEqual([255, 0, 0, 255]);

        renderer.destroy();
        graphics.destroy();
    });
});
