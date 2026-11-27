import { ExtensionType } from '../../../extensions/Extensions';
import { CLEAR } from '../../renderers/gl/const';
import { STENCIL_MODES } from '../../renderers/shared/state/const';

import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Renderer } from '../../renderers/types';
import type { StencilMask } from './StencilMask';
import type { StencilMaskInstruction } from './StencilMaskTypes';

/**
 * A stencil mask opened while building an instruction set, with the mask instructions its pop replays.
 * @internal
 */
export interface OpenStencilMask
{
    pipe: StencilMaskPipe;
    maskContainer: Container;
    inverse: boolean;
    instructionsStart: number;
    instructionsLength: number;
}

/** @internal */
export class StencilMaskPipe implements InstructionPipe<StencilMaskInstruction>
{
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
        ],
        name: 'stencilMask',
    } as const;

    private _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public push(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const effect = mask as StencilMask;
        const maskContainer = effect.mask;
        const inverse = !!_container._maskOptions.inverse;
        const pending = instructionSet._pendingStencilPop;

        // a pop directly followed by a push of the same mask leaves the stencil unchanged: keep the mask open
        if (pending && pending.maskContainer === maskContainer && pending.inverse === inverse)
        {
            instructionSet._pendingStencilPop = null;
            instructionSet._openStencilMasks.push(pending);

            return;
        }

        const renderer = this._renderer;

        renderer.renderPipes.batch.break(instructionSet);

        renderer.renderPipes.blendMode.setBlendMode(maskContainer as Renderable, 'none', instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'pushMaskBegin',
            mask,
            inverse,
            canBundle: false,
        } as StencilMaskInstruction);

        maskContainer.includeInBuild = true;

        const instructionsStart = instructionSet.instructionSize;

        maskContainer.collectRenderables(
            instructionSet,
            renderer,
            null
        );

        maskContainer.includeInBuild = false;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'pushMaskEnd',
            mask,
            inverse,
            canBundle: false,
        } as StencilMaskInstruction);

        // kept per push, as a pooled mask effect can be pushed again later in the build
        instructionSet._openStencilMasks.push({
            pipe: this,
            maskContainer,
            inverse,
            instructionsStart,
            instructionsLength: instructionSet.instructionSize - instructionsStart - 1,
        });
    }

    public pop(_mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        instructionSet._flushPendingStencilPop();
        instructionSet._pendingStencilPop = instructionSet._openStencilMasks.pop();

        // an advanced blend mode's filter pass must not run on across the mask boundary
        if (this._renderer.renderPipes.blendMode.isAdvanced)
        {
            this.emitPendingPop(instructionSet);
        }
    }

    /**
     * Writes the stencil pop deferred by {@link StencilMaskPipe#pop}.
     * @param instructionSet - the instruction set being built
     * @internal
     */
    public emitPendingPop(instructionSet: InstructionSet): void
    {
        const openMask = instructionSet._pendingStencilPop;

        instructionSet._pendingStencilPop = null;

        const renderer = this._renderer;

        // stencil is stored based on current render target..
        renderer.renderPipes.batch.break(instructionSet);
        renderer.renderPipes.blendMode.setBlendMode(openMask.maskContainer as Renderable, 'none', instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'popMaskBegin',
            inverse: openMask.inverse,
            canBundle: false,
        } as StencilMaskInstruction);

        for (let i = 0; i < openMask.instructionsLength; i++)
        {
            instructionSet.instructions[instructionSet.instructionSize++]
                = instructionSet.instructions[openMask.instructionsStart + i];
        }

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'popMaskEnd',
            canBundle: false,
        });
    }

    public execute(instruction: StencilMaskInstruction)
    {
        const renderer = this._renderer;

        const gpuRenderer = renderer as WebGLRenderer | WebGPURenderer;
        const gpuRenderTarget = gpuRenderer.renderTarget.getGpuRenderTarget(gpuRenderer.renderTarget.renderTarget);

        let maskStackIndex = gpuRenderTarget.maskStackIndex;

        if (instruction.action === 'pushMaskBegin')
        {
            // we create the depth and stencil buffers JIT
            // as no point allocating the memory if we don't use it
            gpuRenderer.renderTarget.ensureDepthStencil();

            gpuRenderer.stencil.setStencilMode(STENCIL_MODES.RENDERING_MASK_ADD, maskStackIndex);

            maskStackIndex++;

            gpuRenderer.colorMask.setMask(0);
        }
        else if (instruction.action === 'pushMaskEnd')
        {
            if (instruction.inverse)
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.INVERSE_MASK_ACTIVE, maskStackIndex);
            }
            else
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.MASK_ACTIVE, maskStackIndex);
            }

            gpuRenderer.colorMask.setMask(0xF);
        }
        else if (instruction.action === 'popMaskBegin')
        {
            gpuRenderer.colorMask.setMask(0);

            if (maskStackIndex !== 0)
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.RENDERING_MASK_REMOVE, maskStackIndex);
            }
            else
            {
                gpuRenderer.renderTarget.clear(null, CLEAR.STENCIL);
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.DISABLED, maskStackIndex);
            }

            maskStackIndex--;
        }
        else if (instruction.action === 'popMaskEnd')
        {
            if (instruction.inverse)
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.INVERSE_MASK_ACTIVE, maskStackIndex);
            }
            else
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.MASK_ACTIVE, maskStackIndex);
            }

            gpuRenderer.colorMask.setMask(0xF);
        }

        gpuRenderTarget.maskStackIndex = maskStackIndex;
    }

    public destroy()
    {
        this._renderer = null;
    }
}
