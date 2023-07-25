import type { Instruction } from './Instruction';

let UID = 0;

export class InstructionSet
{
    public uid = UID++;
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
