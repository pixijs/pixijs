import { GpuEncoderSystem } from '../../renderers/gpu/GpuEncoderSystem';
import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';
import { GpuBatchAdaptor } from '../gpu/GpuBatchAdaptor';

import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { Batch } from '../shared/Batcher';
import type { BatcherPipe } from '../shared/BatcherPipe';

// A WebGPU renderer reduced to what GpuBatchAdaptor.execute and GpuEncoderSystem.setBindGroup touch,
// with a real encoder in front of a recording pass encoder.
function setup()
{
    const pass = {
        setBindGroup: jest.fn(),
        setPipeline: jest.fn(),
        drawIndexed: jest.fn(),
    };
    const renderer = {
        gc: { now: 1000 },
        pipeline: { getPipeline: jest.fn(() => ({})) },
        bindGroup: {
            getBindGroup: jest.fn((bindGroup: BindGroup) =>
            {
                bindGroup._gpuEntry ??= {} as BindGroup['_gpuEntry'];

                return {};
            }),
        },
        limits: { maxBatchableTextures: 16 },
    } as unknown as WebGPURenderer & { gc: { now: number } };

    const encoder = new GpuEncoderSystem(renderer);

    encoder.renderPassEncoder = pass as unknown as GPURenderPassEncoder;
    (renderer as { encoder: GpuEncoderSystem }).encoder = encoder;

    const adaptor = new GpuBatchAdaptor();

    adaptor['_shader'] = { gpuProgram: {}, _overrides: undefined } as unknown as GpuBatchAdaptor['_shader'];
    adaptor['_geometry'] = {} as GpuBatchAdaptor['_geometry'];

    const batchPipe = { renderer } as unknown as BatcherPipe;

    function draw(bindGroup: BindGroup, blendMode: Batch['blendMode']): void
    {
        adaptor.execute(batchPipe, { bindGroup, blendMode, topology: 'triangle-list', size: 6, start: 0 } as Batch);
    }

    return { pass, renderer, draw };
}

describe('GpuBatchAdaptor', () =>
{
    it('should not rebind the textures of a batch that broke only on blend mode', () =>
    {
        const { pass, draw } = setup();
        const textures = new BindGroup({ 0: new TextureSource() });
        const others = new BindGroup({ 0: new TextureSource() });

        draw(textures, 'normal');
        draw(textures, 'add');
        draw(textures, 'multiply');
        draw(others, 'multiply');

        expect(pass.drawIndexed).toHaveBeenCalledTimes(4);
        expect(pass.setBindGroup).toHaveBeenCalledTimes(2);
    });

    it('should stamp a bind group\'s textures for the GC once a frame however often it is bound', () =>
    {
        const { renderer, draw } = setup();
        const sourceA = new TextureSource();
        const sourceB = new TextureSource();
        const a = new BindGroup({ 0: sourceA });
        const b = new BindGroup({ 0: sourceB });
        const touchA = jest.spyOn(a, '_touch');
        const touchB = jest.spyOn(b, '_touch');

        // alternating groups miss the encoder's cache on every draw
        draw(a, 'normal');
        draw(b, 'normal');
        draw(a, 'normal');
        draw(b, 'normal');

        expect(touchA).toHaveBeenCalledTimes(1);
        expect(touchB).toHaveBeenCalledTimes(1);
        expect(sourceA._gcLastUsed).toBe(1000);

        renderer.gc.now = 1016;
        draw(a, 'normal');

        expect(touchA).toHaveBeenCalledTimes(2);
        expect(sourceA._gcLastUsed).toBe(1016);
    });

    it('should stamp a resource bound into a group after the group was stamped this frame', () =>
    {
        const { draw } = setup();
        const first = new TextureSource();
        const later = new TextureSource();
        const group = new BindGroup({ 0: first });
        const other = new BindGroup({ 0: new TextureSource() });

        draw(group, 'normal');
        draw(other, 'normal');

        group.setResource(later, 0);
        draw(group, 'normal');

        expect(later._gcLastUsed).toBe(1000);
    });
});
