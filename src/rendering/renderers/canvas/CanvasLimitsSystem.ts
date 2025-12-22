import { ExtensionType } from '../../../extensions/Extensions';

import type { System } from '../shared/system/System';

/**
 * Basic limits for CanvasRenderer.
 * @category rendering
 * @advanced
 */
export class CanvasLimitsSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasSystem,
        ],
        name: 'limits',
    } as const;

    public maxTextures = 16;
    public maxBatchableTextures = 16;
    public maxUniformBindings = 0;

    public init(): void
    {
        // fixed limits for canvas
    }
}
