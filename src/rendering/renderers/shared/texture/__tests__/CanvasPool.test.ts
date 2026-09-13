import { CanvasPoolClass } from '../CanvasPool';

describe('CanvasPool', () =>
{
    let pool: CanvasPoolClass;

    beforeEach(() =>
    {
        pool = new CanvasPoolClass();
    });

    afterEach(() =>
    {
        pool.clear();
    });

    it('should round up to a power of two while no screen is registered', () =>
    {
        const { canvas } = pool.getOptimalCanvasAndContext(1280, 300);

        expect(canvas.width).toBe(2048);
        expect(canvas.height).toBe(512);
    });

    it('should cap each axis to the screen when the request fits', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const { canvas } = pool.getOptimalCanvasAndContext(1280, 300);

        expect(canvas.width).toBe(1280);
        expect(canvas.height).toBe(512);
    });

    it('should report the size a request would get without taking a canvas', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const size = pool.getOptimalSize(1280, 300);

        expect(size).toEqual({ width: 1280, height: 512 });
        expect(pool.getOptimalSize(640, 150, 2)).toEqual({ width: 1280, height: 512 });

        const { canvas } = pool.getOptimalCanvasAndContext(1280, 300);

        expect(canvas.width).toBe(size.width);
        expect(canvas.height).toBe(size.height);
    });

    it('should never cap upwards', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const { canvas } = pool.getOptimalCanvasAndContext(1300, 300);

        expect(canvas.width).toBe(2048);
        expect(canvas.height).toBe(512);
    });

    it('should use physical pixels when the resolution is not 1', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const { canvas } = pool.getOptimalCanvasAndContext(640, 360, 2);

        expect(canvas.width).toBe(1280);
        expect(canvas.height).toBe(720);
    });

    it('should pick the smallest screen the request fits in when several are registered', () =>
    {
        pool.setScreenSize(1, 1280, 720);
        pool.setScreenSize(2, 800, 600);

        const large = pool.getOptimalCanvasAndContext(1280, 720);
        const small = pool.getOptimalCanvasAndContext(800, 600);
        const fits = pool.getOptimalCanvasAndContext(700, 500);

        expect([large.canvas.width, large.canvas.height]).toEqual([1280, 720]);
        expect([small.canvas.width, small.canvas.height]).toEqual([800, 600]);
        // 700 fits in the 800 wide screen, 500 fits in both screens but 512 is smaller than either
        expect([fits.canvas.width, fits.canvas.height]).toEqual([800, 512]);
    });

    it('should keep capped and power-of-two requests in separate buckets', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const capped = pool.getOptimalCanvasAndContext(1280, 300);
        const po2 = pool.getOptimalCanvasAndContext(1300, 300);

        expect(capped.canvas).not.toBe(po2.canvas);

        pool.returnCanvasAndContext(capped);
        pool.returnCanvasAndContext(po2);

        expect(pool.getOptimalCanvasAndContext(1300, 300).canvas).toBe(po2.canvas);
        expect(pool.getOptimalCanvasAndContext(1280, 300).canvas).toBe(capped.canvas);
    });

    it('should not prune when a screen is re-registered with the same size', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const canvasAndContext = pool.getOptimalCanvasAndContext(1280, 720);

        pool.returnCanvasAndContext(canvasAndContext);
        pool.setScreenSize(1, 1280, 720);

        expect(pool.getOptimalCanvasAndContext(1280, 720).canvas).toBe(canvasAndContext.canvas);
    });

    it('should prune only the screen buckets when a renderer is removed', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const screenCanvas = pool.getOptimalCanvasAndContext(1280, 720);
        const po2Canvas = pool.getOptimalCanvasAndContext(256, 256);

        pool.returnCanvasAndContext(screenCanvas);
        pool.returnCanvasAndContext(po2Canvas);

        pool.removeScreen(1);

        // the power-of-two ladder is never pruned
        expect(pool.getOptimalCanvasAndContext(256, 256).canvas).toBe(po2Canvas.canvas);
        expect(pool.getOptimalCanvasAndContext(1280, 720).canvas).not.toBe(screenCanvas.canvas);
    });

    it('should prune the old buckets when a renderer changes size', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const oldCanvas = pool.getOptimalCanvasAndContext(1280, 720);

        pool.returnCanvasAndContext(oldCanvas);

        pool.setScreenSize(1, 800, 600);

        const newCanvas = pool.getOptimalCanvasAndContext(800, 600);

        expect(newCanvas.canvas).not.toBe(oldCanvas.canvas);
        expect([newCanvas.canvas.width, newCanvas.canvas.height]).toEqual([800, 600]);
    });

    it('should drop a canvas returned after its bucket was pruned', () =>
    {
        pool.setScreenSize(1, 1280, 720);

        const canvasAndContext = pool.getOptimalCanvasAndContext(1280, 720);

        pool.removeScreen(1);

        expect(() => pool.returnCanvasAndContext(canvasAndContext)).not.toThrow();

        pool.setScreenSize(1, 1280, 720);

        expect(pool.getOptimalCanvasAndContext(1280, 720).canvas).not.toBe(canvasAndContext.canvas);
    });
});
