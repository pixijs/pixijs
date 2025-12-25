import { ExtensionType } from '../../../../extensions/Extensions';
import { RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import { type CanvasRenderTarget, CanvasRenderTargetAdaptor } from './CanvasRenderTargetAdaptor';

import type { CanvasRenderer } from '../CanvasRenderer';

/**
 * The Canvas adaptor for the render target system.
 * @category rendering
 * @advanced
 */
export class CanvasRenderTargetSystem extends RenderTargetSystem<CanvasRenderTarget>
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.CanvasSystem],
        name: 'renderTarget',
    } as const;

    public adaptor = new CanvasRenderTargetAdaptor();

    constructor(renderer: CanvasRenderer)
    {
        super(renderer);

        this.adaptor.init(renderer, this);
    }
}
