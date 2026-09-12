import { ExtensionType } from '../../../extensions/Extensions';
import { GpuStencilModesToPixi } from '../gpu/state/GpuStencilModesToPixi';
import { STENCIL_MODES } from '../shared/state/const';

import type { RenderTarget } from '../shared/renderTarget/RenderTarget';
import type { System } from '../shared/system/System';
import type { GlRenderTarget } from './GlRenderTarget';
import type { WebGLRenderer } from './WebGLRenderer';

/**
 * This manages the stencil buffer. Used primarily for masking
 * @category rendering
 * @advanced
 */
export class GlStencilSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'stencil',
    } as const;

    private readonly _renderer: WebGLRenderer;
    private _gl: WebGLRenderingContext;

    private readonly _stencilCache = {
        enabled: false,
        stencilReference: 0,
        stencilMode: STENCIL_MODES.NONE,
    };

    private _stencilOpsMapping: {
        keep: number;
        zero: number;
        replace: number;
        invert: number;
        'increment-clamp': number;
        'decrement-clamp': number;
        'increment-wrap': number;
        'decrement-wrap': number;
    };

    private _comparisonFuncMapping: {
        always: number;
        never: number;
        equal: number;
        'not-equal': number;
        less: number;
        'less-equal': number;
        greater: number;
        'greater-equal': number;
    };

    private _activeRenderTarget: RenderTarget;
    /** the backend counterpart of the active render target, which carries the stencil state being tracked */
    private _activeGpuRenderTarget: GlRenderTarget;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;

        renderer.renderTarget.onRenderTargetChange.add(this);
    }

    protected contextChange(gl: WebGLRenderingContext)
    {
        // TODO - this could be declared in a gl const
        // we know the numbers don't tend to change!
        this._gl = gl;

        this._comparisonFuncMapping = {
            always: gl.ALWAYS,
            never: gl.NEVER,
            equal: gl.EQUAL,
            'not-equal': gl.NOTEQUAL,
            less: gl.LESS,
            'less-equal': gl.LEQUAL,
            greater: gl.GREATER,
            'greater-equal': gl.GEQUAL,
        };

        this._stencilOpsMapping = {
            keep: gl.KEEP,
            zero: gl.ZERO,
            replace: gl.REPLACE,
            invert: gl.INVERT,
            'increment-clamp': gl.INCR,
            'decrement-clamp': gl.DECR,
            'increment-wrap': gl.INCR_WRAP,
            'decrement-wrap': gl.DECR_WRAP,
        };

        // the backend render targets were rebuilt with the context, so the stencil state starts over;
        // the next setStencilMode picks up the rebuilt object, as no change event announces it
        this._activeGpuRenderTarget = null;

        this.resetState();
    }

    protected onRenderTargetChange(renderTarget: RenderTarget)
    {
        if (this._activeRenderTarget === renderTarget) return;

        this._activeRenderTarget = renderTarget;

        const gpuRenderTarget = this._renderer.renderTarget.getGpuRenderTarget(renderTarget);

        this._activeGpuRenderTarget = gpuRenderTarget;

        // restore the current render targets stencil state..
        this.setStencilMode(gpuRenderTarget.stencilMode, gpuRenderTarget.stencilReference);
    }

    public resetState()
    {
        // reset stencil cache
        this._stencilCache.enabled = false;
        this._stencilCache.stencilMode = STENCIL_MODES.NONE;
        this._stencilCache.stencilReference = 0;
    }

    public setStencilMode(stencilMode: STENCIL_MODES, stencilReference: number)
    {
        const gpuRenderTarget = this._activeGpuRenderTarget
            ??= this._renderer.renderTarget.getGpuRenderTarget(this._activeRenderTarget);

        const gl = this._gl;
        const mode = GpuStencilModesToPixi[stencilMode];

        const _stencilCache = this._stencilCache;

        // store the stencil state for restoration later, if a render target changes
        gpuRenderTarget.stencilMode = stencilMode;
        gpuRenderTarget.stencilReference = stencilReference;

        if (stencilMode === STENCIL_MODES.DISABLED)
        {
            if (this._stencilCache.enabled)
            {
                this._stencilCache.enabled = false;

                gl.disable(gl.STENCIL_TEST);
            }

            return;
        }

        if (!this._stencilCache.enabled)
        {
            this._stencilCache.enabled = true;
            gl.enable(gl.STENCIL_TEST);
        }

        if (stencilMode !== _stencilCache.stencilMode || _stencilCache.stencilReference !== stencilReference)
        {
            _stencilCache.stencilMode = stencilMode;
            _stencilCache.stencilReference = stencilReference;

            // this is pretty simple mapping.
            // will work for pixi's simple mask cases.
            // although a true mapping of the GPU state to webGL state should be done
            gl.stencilFunc(this._comparisonFuncMapping[mode.stencilBack.compare], stencilReference, 0xFF);
            gl.stencilOp(gl.KEEP, gl.KEEP, this._stencilOpsMapping[mode.stencilBack.passOp]);
        }
    }

    public destroy()
    {
        this._renderer.renderTarget.onRenderTargetChange.remove(this);

        (this._renderer as null) = null;
        this._gl = null;

        this._activeRenderTarget = null;
        this._activeGpuRenderTarget = null;
    }
}
