import { ExtensionType } from '../../../extensions/Extensions';
import { collectAllRenderables } from '../../../scene/container/utils/buildInstructions';
import { CLEAR } from '../../renderers/gl/const';
import { STENCIL_MODES } from '../../renderers/shared/state/const';

import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { StencilMask } from './StencilMask';

type MaskMode = 'pushMaskBegin' | 'pushMaskEnd' | 'popMaskBegin' | 'popMaskEnd';

export interface StencilMaskInstruction extends Instruction
{
    renderPipeId: 'stencilMask',
    action: MaskMode,
    mask: StencilMask,
}

export class StencilMaskPipe implements InstructionPipe<StencilMaskInstruction>
{
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'stencilMask',
    } as const;

    private _renderer: Renderer;

    // used when building and also when executing..
    private _maskStackHash: Record<number, number> = {};

    private _maskHash = new WeakMap<StencilMask, {
        instructionsStart: number,
        instructionsLength: number,
    }>();

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public push(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const effect = mask as StencilMask;

        const renderer = this._renderer;

        renderer.renderPipes.batch.break(instructionSet);
        renderer.renderPipes.blendMode.setBlendMode(effect.mask, 'none', instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'pushMaskBegin',
            mask,
            canBundle: false,
        } as StencilMaskInstruction);

        const maskContainer = effect.mask;

        maskContainer.includeInBuild = true;

        if (!this._maskHash.has(effect))
        {
            this._maskHash.set(effect, {
                instructionsStart: 0,
                instructionsLength: 0,
            });
        }

        const maskData = this._maskHash.get(effect);

        maskData.instructionsStart = instructionSet.instructionSize;

        collectAllRenderables(
            maskContainer,
            instructionSet,
            renderer.renderPipes,
        );

        maskContainer.includeInBuild = false;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'pushMaskEnd',
            mask,
            canBundle: false,
        } as StencilMaskInstruction);

        const instructionsLength = instructionSet.instructionSize - maskData.instructionsStart - 1;

        maskData.instructionsLength = instructionsLength;

        const renderTargetUid = renderer.renderTarget.renderTarget.uid;

        if (this._maskStackHash[renderTargetUid] === undefined)
        {
            this._maskStackHash[renderTargetUid] = 0;
        }

        this._maskStackHash[renderTargetUid]++;
    }

    public pop(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const effect = mask as StencilMask;

        const renderer = this._renderer;

        const renderTargetUid = renderer.renderTarget.renderTarget.uid;

        // stencil is stored based on current render target..

        this._maskStackHash[renderTargetUid]--;

        renderer.renderPipes.batch.break(instructionSet);
        renderer.renderPipes.blendMode.setBlendMode(effect.mask, 'none', instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'popMaskBegin',
            canBundle: false,
        });

        const maskData = this._maskHash.get(mask as StencilMask);

        if (this._maskStackHash[renderTargetUid] !== 0)
        {
            for (let i = 0; i < maskData.instructionsLength; i++)
            {
                // eslint-disable-next-line max-len
                instructionSet.instructions[instructionSet.instructionSize++] = instructionSet.instructions[maskData.instructionsStart++];
            }
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
        const renderTargetUid = renderer.renderTarget.renderTarget.uid;

        let maskStackIndex = this._maskStackHash[renderTargetUid] ?? 0;

        if (instruction.action === 'pushMaskBegin')
        {
            maskStackIndex++;

            renderer.stencil.setStencilMode(STENCIL_MODES.RENDERING_MASK_ADD, maskStackIndex);
            renderer.colorMask.setMask(0);
        }
        else if (instruction.action === 'pushMaskEnd')
        {
            renderer.stencil.setStencilMode(STENCIL_MODES.MASK_ACTIVE, maskStackIndex);
            renderer.colorMask.setMask(0xF);
        }
        else if (instruction.action === 'popMaskBegin')
        {
            maskStackIndex--;

            if (maskStackIndex !== 0)
            {
                renderer.stencil.setStencilMode(STENCIL_MODES.RENDERING_MASK_REMOVE, maskStackIndex);
                renderer.colorMask.setMask(0);
            }
            else
            {
                renderer.renderTarget.clear(CLEAR.STENCIL);
            }
        }
        else if (instruction.action === 'popMaskEnd')
        {
            if (maskStackIndex === 0)
            {
                renderer.stencil.setStencilMode(STENCIL_MODES.DISABLED, maskStackIndex);
            }
            else
            {
                renderer.stencil.setStencilMode(STENCIL_MODES.MASK_ACTIVE, maskStackIndex);
            }

            renderer.colorMask.setMask(0xF);
        }

        this._maskStackHash[renderTargetUid] = maskStackIndex;
    }

    public destroy()
    {
        this._renderer = null;
        this._maskStackHash = null;
        this._maskHash = null;
    }
}
