import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { ScissorMask } from './ScissorMask';

/** @internal */
export interface ScissorMaskInstruction extends Instruction
{
    renderPipeId: 'scissorMask',
    action: 'pushMask' | 'popMask',
    mask: ScissorMask,
}
