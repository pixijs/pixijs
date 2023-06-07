import { ExtensionType } from '../../../extensions/Extensions';
import { Bounds } from '../../scene/bounds/Bounds';
import { getGlobalBounds } from '../../scene/bounds/getGlobalBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Container } from '../../scene/Container';
import type { ScissorMask } from '../shared/ScissorMask';

type MaskMode = 'pushMaskBegin' | 'pushMaskEnd' | 'popMaskBegin' | 'popMaskEnd';

export interface ScissorMaskInstruction extends Instruction
{
    type: 'scissorMask',
    action: MaskMode,
    mask: ScissorMask
}

const tempBounds = new Bounds();

export class GpuScissorMaskPipe implements InstructionPipe<ScissorMaskInstruction>
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGPURendererPipes,
        ],
        name: 'scissorMask',
    };

    private renderer: WebGPURenderer;

    constructor(renderer: WebGPURenderer)
    {
        this.renderer = renderer;
    }

    push(mask: ScissorMask, _container: Container, instructionSet: InstructionSet): void
    {
        this.renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'scissorMask',
            action: 'pushMaskBegin',
            mask,
            canBundle: false,
        } as ScissorMaskInstruction);
    }

    pop(_mask: ScissorMask, _container: Container, instructionSet: InstructionSet): void
    {
        this.renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'scissorMask',
            action: 'popMaskEnd',
            canBundle: false,
        });
    }

    execute(instruction: ScissorMaskInstruction)
    {
        const renderer = this.renderer;

        if (instruction.action === 'pushMaskBegin')
        {
            const bounds = getGlobalBounds(instruction.mask.mask, true, tempBounds);

            bounds.ceil();

            renderer.encoder.setScissor(bounds);
        }
        else if (instruction.action === 'popMaskEnd')
        {
            renderer.encoder.clearScissor();
        }
    }
}
