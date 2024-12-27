import { uid } from '../../../../utils/data/uid';

import type { Renderable } from '../Renderable';
import type { Instruction } from './Instruction';

/**
 * A set of instructions that can be executed by the renderer.
 * Basically wraps an array, but with some extra properties that help the renderer
 * to keep things nice and optimised.
 *
 * Note:
 * InstructionSet.instructions contains all the instructions, but does not resize (for performance).
 * So for the true length of the instructions you need to use InstructionSet.instructionSize
 * @memberof rendering
 */
export class InstructionSet
{
    /** a unique id for this instruction set used through the renderer */
    public readonly uid: number = uid('instructionSet');
    /** the array of instructions */
    public readonly instructions: Instruction[] = [];
    /** the actual size of the array (any instructions passed this should be ignored) */
    public instructionSize = 0;
    /** allows for access to the render pipes of the renderer */
    public renderPipes: any;

    public renderables: Renderable[] = [];
    /** used by the garbage collector to track when the instruction set was last used */
    public gcTick = 0;

    /** reset the instruction set so it can be reused set size back to 0 */
    public reset()
    {
        this.instructionSize = 0;
    }

    /**
     * Add an instruction to the set
     * @param instruction - add an instruction to the set
     */
    public add(instruction: Instruction)
    {
        this.instructions[this.instructionSize++] = instruction;
    }

    /**
     * Log the instructions to the console (for debugging)
     * @internal
     * @ignore
     */
    public log()
    {
        this.instructions.length = this.instructionSize;
        // eslint-disable-next-line no-console
        console.table(this.instructions, ['type', 'action']);
    }
}
