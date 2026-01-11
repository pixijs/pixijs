import type { Instruction } from '../../renderers/shared/instructions/Instruction';

/** @internal */
export interface ColorMaskInstruction extends Instruction
{
    renderPipeId: 'colorMask',
    colorMask: number,
}
