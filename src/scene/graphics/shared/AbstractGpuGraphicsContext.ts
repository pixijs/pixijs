import { BigPool } from '../../../utils/pool/PoolGroup';

import type { BatchableElement } from '../../../rendering/batcher/shared/Batcher';
import type { GPUData } from '../../view/ViewContainer';
import type { GraphicsContext } from './GraphicsContext';

/**
 * Base class for per-context GPU data shared between graphics and smooth-graphics.
 * Stores batchable elements and render data, with pooled reset/destroy lifecycle.
 * @category rendering
 * @internal
 */
export class AbstractGpuGraphicsContext<TBatch extends BatchableElement, TRenderData> implements GPUData
{
    public isBatchable: boolean;
    public context: GraphicsContext;
    public batches: TBatch[] = [];
    public graphicsData: TRenderData;

    public reset(): void
    {
        if (this.batches)
        {
            this.batches.forEach((batch) =>
            {
                BigPool.return(batch);
            });
        }
        if (this.graphicsData)
        {
            BigPool.return(this.graphicsData as any);
        }

        this.isBatchable = false;
        this.context = null;
        this.batches.length = 0;
        this.graphicsData = null;
    }

    public destroy(): void
    {
        this.reset();
        this.batches = null;
    }
}
