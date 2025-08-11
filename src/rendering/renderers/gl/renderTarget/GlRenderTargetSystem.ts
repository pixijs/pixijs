import { ExtensionType } from '../../../../extensions/Extensions';
import { RenderTargetSystem } from '../../shared/renderTarget/RenderTargetSystem';
import { GlRenderTargetAdaptor } from './GlRenderTargetAdaptor';

import type { GlRenderTarget } from '../GlRenderTarget';
import type { WebGLRenderer } from '../WebGLRenderer';

const typeSymbol = Symbol.for('pixijs.GlRenderTargetSystem');

/**
 * The WebGL adaptor for the render target system. Allows the Render Target System to be used with the WebGl renderer
 * @category rendering
 * @advanced
 */
export class GlRenderTargetSystem extends RenderTargetSystem<GlRenderTarget>
{
    /**
     * Type symbol used to identify instances of GlRenderTargetSystem.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GlRenderTargetSystem.
     * @param obj - The object to check.
     * @returns True if the object is a GlRenderTargetSystem, false otherwise.
     */
    public static isGlRenderTargetSystem(obj: any): obj is GlRenderTargetSystem
    {
        return !!obj && !!obj[typeSymbol];
    }

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
