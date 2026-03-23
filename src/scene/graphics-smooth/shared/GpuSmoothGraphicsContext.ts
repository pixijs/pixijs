import { AbstractGpuGraphicsContext } from '../../graphics/shared/AbstractGpuGraphicsContext';

import type { BatchableSmoothGraphics } from './BatchableSmoothGraphics';
import type { SmoothGraphicsContextRenderData } from './SmoothGraphicsContextSystem';

/**
 * Per-context GPU data for smooth graphics rendering.
 * Stores the batchable elements generated from a GraphicsContext.
 * @category rendering
 * @internal
 */
// eslint-disable-next-line max-len
export class GpuSmoothGraphicsContext extends AbstractGpuGraphicsContext<BatchableSmoothGraphics, SmoothGraphicsContextRenderData>
{
}
