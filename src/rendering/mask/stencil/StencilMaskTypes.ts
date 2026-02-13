import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { StencilMask } from './StencilMask';

/** @internal */
export type MaskMode = 'pushMaskBegin' | 'pushMaskEnd' | 'popMaskBegin' | 'popMaskEnd';

/** @internal */
export interface StencilMaskInstruction extends Instruction
{
    renderPipeId: 'stencilMask',
    action: MaskMode,
    inverse: boolean,
    mask: StencilMask,
}
