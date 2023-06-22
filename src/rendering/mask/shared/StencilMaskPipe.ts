import { ExtensionType } from '../../../extensions/Extensions';
import { STENCIL_MODES } from '../../renderers/shared/state/const';
import { collectAllRenderables } from '../../scene/utils/buildInstructions';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { Container } from '../../scene/Container';
import type { StencilMask } from './StencilMask';

type MaskMode = 'pushMaskBegin' | 'pushMaskEnd' | 'popMaskBegin' | 'popMaskEnd';

export interface StencilMaskInstruction extends Instruction
{
    type: 'stencilMask',
    action: MaskMode,
    mask: StencilMask,
}

export class StencilMaskPipe implements InstructionPipe<StencilMaskInstruction>
{
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'stencilMask',
    };

    private renderer: Renderer;

    // used when building and also when executing..
    private maskStackHash: Record<number, number> = {};

    private maskHash = new WeakMap<StencilMask, {
        instructionsStart: number,
        instructionsLength: number,
    }>();

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    push(mask: StencilMask, _container: Container, instructionSet: InstructionSet): void
    {
        const renderer = this.renderer;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'stencilMask',
            action: 'pushMaskBegin',
            mask,
            canBundle: false,
        } as StencilMaskInstruction);

        const maskContainer = mask.mask;

        maskContainer.includeInBuild = true;

        if (!this.maskHash.has(mask))
        {
            this.maskHash.set(mask, {
                instructionsStart: 0,
                instructionsLength: 0,
            });
        }

        const maskData = this.maskHash.get(mask);

        maskData.instructionsStart = instructionSet.instructionSize;

        collectAllRenderables(
            maskContainer,
            instructionSet,
            renderer.renderPipes,
        );

        maskContainer.includeInBuild = false;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'stencilMask',
            action: 'pushMaskEnd',
            mask,
            canBundle: false,
        } as StencilMaskInstruction);

        const instructionsLength = instructionSet.instructionSize - maskData.instructionsStart - 1;

        maskData.instructionsLength = instructionsLength;

        if (this.maskStackHash[_container.uid] === undefined)
        {
            this.maskStackHash[_container.uid] = 0;
        }

        this.maskStackHash[_container.uid]++;
    }

    pop(mask: StencilMask, _container: Container, instructionSet: InstructionSet): void
    {
        const renderer = this.renderer;

        // stencil is stored based on current render target..

        this.maskStackHash[_container.uid]--;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'stencilMask',
            action: 'popMaskBegin',
            canBundle: false,
        });

        const maskData = this.maskHash.get(mask);

        if (this.maskStackHash[_container.uid])
        {
            for (let i = 0; i < maskData.instructionsLength; i++)
            {
                // eslint-disable-next-line max-len
                instructionSet.instructions[instructionSet.instructionSize++] = instructionSet.instructions[maskData.instructionsStart++];
            }
        }

        instructionSet.add({
            type: 'stencilMask',
            action: 'popMaskEnd',
            canBundle: false,
        });
    }

    execute(instruction: StencilMaskInstruction)
    {
        const renderer = this.renderer;
        const currentRenderTargetUid = renderer.renderTarget.renderTarget.uid;

        let maskStackIndex = this.maskStackHash[currentRenderTargetUid] ?? 0;

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

        this.maskStackHash[currentRenderTargetUid] = maskStackIndex;
    }

    destroy()
    {
        this.renderer = null;
        this.maskStackHash = null;
        this.maskHash = null;
    }
}
