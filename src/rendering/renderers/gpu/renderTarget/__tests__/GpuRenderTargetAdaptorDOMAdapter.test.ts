import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { CanvasSource } from '../../../shared/texture/sources/CanvasSource';
import { GpuRenderTargetAdaptor } from '../GpuRenderTargetAdaptor';
import { DOMAdapter } from '~/environment';

import type { TEXTURE_FORMATS } from '../../../shared/texture/const';
import type { WebGPURenderer } from '../../WebGPURenderer';
import type { Adapter, ICanvas } from '~/environment';

describe('GpuRenderTargetAdaptor DOMAdapter', () =>
{
    let originalAdapter: Adapter;
    let originalNavigator: PropertyDescriptor;
    let adaptor: GpuRenderTargetAdaptor;
    let target: RenderTarget;
    let source: CanvasSource;
    let configure: jest.Mock;
    let getNavigator: jest.Mock;
    let getPreferredCanvasFormat: jest.Mock<GPUTextureFormat, []>;
    let device: GPUDevice;

    beforeEach(() =>
    {
        originalAdapter = DOMAdapter.get();
        originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
        Reflect.deleteProperty(globalThis, 'navigator');

        getPreferredCanvasFormat = jest.fn<GPUTextureFormat, []>();
        getNavigator = jest.fn().mockReturnValue({
            userAgent: 'test',
            gpu: { getPreferredCanvasFormat },
        });
        DOMAdapter.set({ ...originalAdapter, getNavigator });

        configure = jest.fn();
        const context = { configure };

        source = new CanvasSource({
            resource: { width: 1, height: 1, getContext: jest.fn().mockReturnValue(context) } as unknown as ICanvas,
            width: 1,
            height: 1,
            format: 'rgba32float',
        });
        target = new RenderTarget({ colorTextures: [source] });
        device = {} as GPUDevice;
        adaptor = new GpuRenderTargetAdaptor();
        adaptor.init({
            gpu: { device },
            runners: { contextChange: { add: jest.fn() }, destroy: { add: jest.fn() } },
        } as unknown as WebGPURenderer, null);

        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() =>
    {
        DOMAdapter.set(originalAdapter);
        if (originalNavigator)
        {
            Object.defineProperty(globalThis, 'navigator', originalNavigator);
        }
        else
        {
            Reflect.deleteProperty(globalThis, 'navigator');
        }
        target.destroy();
        source.destroy();
        adaptor.destroy();
        jest.restoreAllMocks();
    });

    it.each<GPUTextureFormat>(['rgba8unorm', 'bgra8unorm'])(
        'uses the adapted %s fallback without a global navigator', (preferred) =>
        {
            getPreferredCanvasFormat.mockReturnValue(preferred);

            expect('navigator' in globalThis).toBe(false);

            const gpuTarget = adaptor.initGpuRenderTarget(target);

            expect(getNavigator).toHaveBeenCalledTimes(1);
            expect(getPreferredCanvasFormat).toHaveBeenCalledTimes(1);
            expect(configure).toHaveBeenCalledWith(expect.objectContaining({ device, format: preferred }));
            expect(gpuTarget.contexts[0]).toBe(source._gpuContext);
            expect(console.warn).toHaveBeenCalledWith('PixiJS Warning: ', expect.stringContaining(
                `CanvasSource format 'rgba32float' is not a valid GPUCanvasContext format. Falling back to '${preferred}'.`
            ));
        }
    );

    it.each<GPUTextureFormat>(['rgba8unorm', 'bgra8unorm'])(
        'prefers the adapted %s fallback over the global GPU', (preferred) =>
        {
            const globalPreferredFormat = jest.fn().mockReturnValue(
                preferred === 'rgba8unorm' ? 'bgra8unorm' : 'rgba8unorm'
            );

            Object.defineProperty(globalThis, 'navigator', {
                configurable: true,
                value: { gpu: { getPreferredCanvasFormat: globalPreferredFormat } },
            });
            getPreferredCanvasFormat.mockReturnValue(preferred);

            adaptor.initGpuRenderTarget(target);

            expect(configure).toHaveBeenCalledWith(expect.objectContaining({ format: preferred }));
            expect(getPreferredCanvasFormat).toHaveBeenCalledTimes(1);
            expect(globalPreferredFormat).not.toHaveBeenCalled();
        }
    );

    it.each<TEXTURE_FORMATS>(['rgba8unorm', 'bgra8unorm', 'rgba16float'])(
        'preserves the supported %s format without querying the navigator', (format) =>
        {
            source.format = format;

            adaptor.initGpuRenderTarget(target);

            expect(configure).toHaveBeenCalledWith(expect.objectContaining({ device, format }));
            expect(getNavigator).not.toHaveBeenCalled();
            expect(console.warn).not.toHaveBeenCalled();
        }
    );
});
