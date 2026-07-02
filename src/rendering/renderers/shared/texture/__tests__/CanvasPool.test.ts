import '~/rendering/init';
import { CanvasPoolClass } from '../CanvasPool';
import { DOMAdapter } from '~/environment/adapter';

describe('CanvasPool', () =>
{
    it('should create 2D contexts with willReadFrequently', () =>
    {
        // Regression test: without willReadFrequently, Firefox's GPU-accelerated 2D canvas
        // can hand texImage2D a stale or blank snapshot of a freshly drawn glyph canvas,
        // making Text objects intermittently render blank.
        const canvas = DOMAdapter.get().createCanvas();
        const getContextSpy = jest.spyOn(canvas, 'getContext');
        const createCanvasSpy = jest.spyOn(DOMAdapter.get(), 'createCanvas')
            .mockReturnValue(canvas);

        const pool = new CanvasPoolClass();

        pool.getOptimalCanvasAndContext(16, 16);

        expect(getContextSpy).toHaveBeenCalledWith('2d', expect.objectContaining({ willReadFrequently: true }));

        createCanvasSpy.mockRestore();
        getContextSpy.mockRestore();
    });
});
