import type { BatchableObject } from '../../../batcher/shared/Batcher';
import type { Renderer } from '../../types';
import type { Renderable } from '../Renderable';
import type { View } from '../View';
import type { Instruction } from './Instruction';
import type { InstructionSet } from './InstructionSet';

export interface InstructionPipe<INSTRUCTION extends Instruction>
{
    upload?: (instructionSet: InstructionSet) => void;
    execute?: (instruction: INSTRUCTION) => void;

    // TODO - implement!
    buildReset?: (instructionSet: InstructionSet) => void;
    buildStart?: (instructionSet: InstructionSet) => void;
    buildEnd?: (instructionSet: InstructionSet) => void;

    renderEnd?: () => void;
    renderStart?: () => void;
}

export interface RenderPipe<VIEW extends View = View>
{
    addRenderable: (renderable: Renderable<VIEW>, instructionSet: InstructionSet) => void;
    updateRenderable: (renderable: Renderable<VIEW>, instructionSet?: InstructionSet) => void;
    destroyRenderable?: (renderable: Renderable<VIEW>) => void;
}

export interface BatchPipe
{
    addToBatch: (renderable: BatchableObject, instructionSet: InstructionSet) => void;
    break: (instructionSet: InstructionSet) => void;
}

export interface PipeConstructor<R = Renderer>
{
    new (renderer: R, adaptor?: any): RenderPipe | BatchPipe | InstructionPipe<any> ;
}
