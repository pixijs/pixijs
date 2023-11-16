import { ExtensionType } from '../../../extensions/Extensions';
import { GlRenderTargetAdaptor } from '../gpu/renderTarget/GlRenderTargetAdaptor';
import { RenderTargetSystem } from '../shared/renderTarget/RenderTargetSystem';

import type { GlRenderTarget } from './GlRenderTarget';
import type { WebGLRenderer } from './WebGLRenderer';

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
