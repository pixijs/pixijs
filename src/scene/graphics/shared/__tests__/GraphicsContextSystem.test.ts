import { GraphicsContext } from '../GraphicsContext';
import { GraphicsContextSystem } from '../GraphicsContextSystem';
import { getWebGLRenderer } from '@test-utils';

describe('GraphicsContextSystem', () =>
{
    describe('ShapeBuildCommand', () =>
    {
        it('should successfully build shapes', async () =>
        {
            const renderer = await getWebGLRenderer();
            const system = new GraphicsContextSystem(renderer);
            const context = new GraphicsContext();

            // rect
            const gpuContext = system.updateGpuContext(context);

            expect(gpuContext.batches.length).toEqual(0);
            context.rect(0, 0, 50, 50).rect(70, 70, 10, 10).fill();
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(2);
            expect(gpuContext.geometryData.vertices.length).toEqual(16); // rect 8 x 2
            context.clear();
            const checkContext = system.updateGpuContext(context);

            expect(gpuContext.batches.length).toEqual(0);
            expect(checkContext).toEqual(gpuContext);

            // circle
            context.circle(30, 30, 3).fill(0x00FF00);
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(1);

            // roundRect
            context.roundRect(0, 0, 30, 30, 5).fill(0x00FF00);
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(2);
            context.roundRect(0, 0, 30, 30, 0).fill();
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(3);
            context.roundRect(50, 10, 30, 30, -100).fill();
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(4);

            // ellipse
            context.ellipse(90, 90, 12, 15).fill(0);
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(5);
        });

        it('should skip shapes correctly', async () =>
        {
            const renderer = await getWebGLRenderer();
            const system = new GraphicsContextSystem(renderer);
            const context = new GraphicsContext();

            // rect
            context.rect(0, 0, 50, 50).rect(100, 20, 0, 15).rect(4, 4, 10, -2).rect(70, 70, 10, 10)
                .fill();
            const gpuContext = system.updateGpuContext(context);

            expect(gpuContext.batches.length).toEqual(2);
            expect(gpuContext.geometryData.vertices.length).toEqual(16);

            // circle
            context.circle(30, 30, 0).fill(0x00FF00);
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(2);
            expect(gpuContext.geometryData.vertices.length).toEqual(16);
            context.circle(130, 130, -2).fill(0x00FF00);
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(2);

            // ellipse
            context.ellipse(90, 90, 0, 15).fill(0);
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(2);
            context.ellipse(90, 90, 12, -15).fill(0);
            system.updateGpuContext(context);
            expect(gpuContext.batches.length).toEqual(2);
        });

        it('should handle different batch modes', async () =>
        {
            const renderer = await getWebGLRenderer();
            const system = new GraphicsContextSystem(renderer);
            const context = new GraphicsContext();

            context.batchMode = 'batch';
            context.rect(0, 0, 50, 50).rect(70, 70, 10, 10).fill(0x000033);
            const gpuContext = system.updateGpuContext(context);

            expect(gpuContext.isBatchable).toEqual(true);
            context.dirty = true;
            context.batchMode = 'no-batch';
            system.updateGpuContext(context);
            expect(gpuContext.isBatchable).toEqual(false);
            context.dirty = true;
            context.batchMode = 'auto';
            system.updateGpuContext(context);
            expect(gpuContext.isBatchable).toEqual(true);
        });
    });
});
