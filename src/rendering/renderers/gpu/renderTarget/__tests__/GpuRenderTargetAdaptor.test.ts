import { GpuRenderTargetAdaptor } from '../GpuRenderTargetAdaptor';

describe('GpuRenderTargetAdaptor', () =>
{
    afterEach(() =>
    {
        GpuRenderTargetAdaptor.canvasFormat = 'bgra8unorm';
        GpuRenderTargetAdaptor.canvasToneMapping = undefined;
    });

    it('should default canvasFormat to bgra8unorm', () =>
    {
        expect(GpuRenderTargetAdaptor.canvasFormat).toEqual('bgra8unorm');
    });

    it('should default canvasToneMapping to undefined', () =>
    {
        expect(GpuRenderTargetAdaptor.canvasToneMapping).toBeUndefined();
    });

    it('should allow canvasFormat to be overridden for HDR output', () =>
    {
        GpuRenderTargetAdaptor.canvasFormat = 'rgba16float';

        expect(GpuRenderTargetAdaptor.canvasFormat).toEqual('rgba16float');
    });

    it('should allow canvasToneMapping to be overridden for HDR output', () =>
    {
        GpuRenderTargetAdaptor.canvasToneMapping = { mode: 'extended' };

        expect(GpuRenderTargetAdaptor.canvasToneMapping).toEqual({ mode: 'extended' });
    });
});
