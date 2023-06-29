import { ExtensionType } from '../../../extensions/Extensions';
import { GpuStencilModesToPixi } from '../gpu/state/GpuStencilModesToPixi';
import { STENCIL_MODES } from '../shared/state/const';

import type { RenderTarget } from '../shared/renderTarget/RenderTarget';
import type { ISystem } from '../shared/system/System';
import type { WebGLRenderer } from './WebGLRenderer';

export class GlStencilSystem implements ISystem
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGLRendererSystem,
        ],
        name: 'stencil',
    } as const;

    private gl: WebGLRenderingContext;

    private stencilCache = {
        enabled: false,
        stencilReference: 0,
    };

    private renderTargetStencilState: Record<number, {
        stencilMode: STENCIL_MODES;
        stencilReference: number;
    }> = {};

    private stencilOpsMapping: {
        keep: number;
        zero: number;
        replace: number;
        invert: number;
        'increment-clamp': number;
        'decrement-clamp': number;
        'increment-wrap': number;
        'decrement-wrap': number;
    };

    private comparisonFuncMapping: {
        always: number;
        never: number;
        equal: number;
        'not-equal': number;
        less: number;
        'less-equal': number;
        greater: number;
        'greater-equal': number;
    };

    private activeRenderTarget: RenderTarget;

    constructor(renderer: WebGLRenderer)
    {
        renderer.renderTarget.onRenderTargetChange.add(this);
    }

    protected contextChange(gl: WebGLRenderingContext)
    {
        // TODO - this could be declared in a gl const
        // we know the numbers don't tend to change!
        this.gl = gl;

        this.comparisonFuncMapping = {
            always: gl.ALWAYS,
            never: gl.NEVER,
            equal: gl.EQUAL,
            'not-equal': gl.NOTEQUAL,
            less: gl.LESS,
            'less-equal': gl.LEQUAL,
            greater: gl.GREATER,
            'greater-equal': gl.GEQUAL,
        };

        this.stencilOpsMapping = {
            keep: gl.KEEP,
            zero: gl.ZERO,
            replace: gl.REPLACE,
            invert: gl.INVERT,
            'increment-clamp': gl.INCR,
            'decrement-clamp': gl.DECR,
            'increment-wrap': gl.INCR_WRAP,
            'decrement-wrap': gl.DECR_WRAP,
        };
    }

    onRenderTargetChange(renderTarget: RenderTarget)
    {
        this.activeRenderTarget = renderTarget;

        let stencilState = this.renderTargetStencilState[renderTarget.uid];

        if (!stencilState)
        {
            stencilState = this.renderTargetStencilState[renderTarget.uid] = {
                stencilMode: STENCIL_MODES.DISABLED,
                stencilReference: 0,
            };
        }

        // restore the current render targets stencil state..
        this.setStencilMode(stencilState.stencilMode, stencilState.stencilReference);
    }

    setStencilMode(stencilMode: STENCIL_MODES, stencilReference: number)
    {
        const stencilState = this.renderTargetStencilState[this.activeRenderTarget.uid];

        // store the stencil state for restoration later, if a render target changes
        stencilState.stencilMode = stencilMode;
        stencilState.stencilReference = stencilReference;

        const mode = GpuStencilModesToPixi[stencilMode];

        const gl = this.gl;

        if (stencilMode === STENCIL_MODES.DISABLED)
        {
            if (this.stencilCache.enabled)
            {
                this.stencilCache.enabled = false;

                gl.disable(gl.STENCIL_TEST);
            }

            return;
        }

        if (!this.stencilCache.enabled)
        {
            this.stencilCache.enabled = true;
            gl.enable(gl.STENCIL_TEST);
        }

        // this is pretty simple mapping.
        // will work for pixi's simple mask cases.
        // although a true mapping of the GPU state to webGL state should be done
        gl.stencilFunc(this.comparisonFuncMapping[mode.stencilBack.compare], stencilReference, 0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, this.stencilOpsMapping[mode.stencilBack.passOp]);
    }

    destroy()
    {
        // boom!
    }
}
