import { ExtensionType } from '../../../../extensions/Extensions';
import { RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import { GlRenderTargetAdaptor } from './GlRenderTargetAdaptor';

import type { GlRenderTarget } from '../GlRenderTarget';
import type { WebGLRenderer } from '../WebGLRenderer';

/**
 * The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGl renderer
 * @memberof rendering
 */
export class GlRenderTargetSystem extends RenderTargetSystem<GlRenderTarget>
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGLSystem],
        name: 'renderTarget',
    } as const;

    public adaptor = new GlRenderTargetAdaptor();

    constructor(renderer: WebGLRenderer)
    {
        super(renderer);

        this.adaptor.init(renderer, this);
    }
}
