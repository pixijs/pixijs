import { uid } from '../../../../utils/data/uid';

import type { Instruction } from './Instruction';

export class InstructionSet
{
    public uid = uid('instructionSet');
    public instructions: Instruction[] = [];
    public instructionSize = 0;
    public renderPipes: any;

    public reset()
    {
        this.instructionSize = 0;
    }

    public add(instruction: Instruction)
    {
        this.instructions[this.instructionSize++] = instruction;
    }

    public log()
    {
        this.instructions.length = this.instructionSize;
        // eslint-disable-next-line no-console
        console.table(this.instructions, ['type', 'action']);
    }

    public lastInstruction()
    {
        return this.instructions[this.instructionSize - 1];
    }
}
