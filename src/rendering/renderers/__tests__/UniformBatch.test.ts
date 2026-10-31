import { GpuUniformBatchPipe } from '../gpu/GpuUniformBatchPipe';
import { SchedulerSystem } from '../shared/SchedulerSystem';
import { SystemRunner } from '../shared/system/SystemRunner';
import { RenderableGCSystem } from '../shared/texture/RenderableGCSystem';
import { getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Container, Graphics } from '~/scene';

import type { WebGPURenderer } from '../gpu/WebGPURenderer';

describe('UniformBatch', () =>
{
    it('should get a bind group correctly', () =>
    {
        const scheduler = new SchedulerSystem();

        const uniformBatchPipe = new GpuUniformBatchPipe({
            scheduler,
            renderableGC: new RenderableGCSystem({} as WebGPURenderer),
            runners: {
                destroy: new SystemRunner('destroy'),
            },
        } as WebGPURenderer);

        const bufferResource = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource.buffer).toBe(uniformBatchPipe['_buffers'][0]);
        expect(bufferResource.offset).toBe(0);

        const bufferResource2 = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource2.buffer).toBe(uniformBatchPipe['_buffers'][1]);
        expect(bufferResource2.offset).toBe(0);

        const bufferResource3 = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource3.buffer).toBe(uniformBatchPipe['_buffers'][0]);
        expect(bufferResource3.offset).toBe(256);

        scheduler.destroy();
    });

    itLocalOnly('should submit one command buffer per render', async () =>
    {
        const renderer = await getWebGPURenderer();
        const container = new Container();
        const spy = jest.spyOn(renderer.gpu.device.queue, 'submit');

        try
        {
            // the global uniforms take slot 0 and each no-batch graphics takes the next, so the first graphics
            // is in slot 1 and every render has to write the shifted buffer
            for (let i = 0; i < 2; i++)
            {
                const graphics = new Graphics().rect(i * 20, 0, 10, 10).fill('red');

                graphics.context.batchMode = 'no-batch';
                container.addChild(graphics);
            }

            // count the second render only, so setup that runs once on the first render can't change the count
            renderer.render(container);
            spy.mockClear();

            renderer.render(container);

            expect(spy).toHaveBeenCalledTimes(1);
        }
        finally
        {
            spy.mockRestore();
            container.destroy({ children: true });
            renderer.destroy();
        }
    });
});
