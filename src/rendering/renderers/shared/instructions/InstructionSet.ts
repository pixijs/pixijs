import type { Instruction } from './Instruction';

let UID = 0;

export class InstructionSet
{
    uid = UID++;
    instructions: Instruction[] = [];
    instructionSize = 0;
    renderPipes: any;

    reset()
    {
        this.instructionSize = 0;
    }

    add(instruction: Instruction)
    {
        this.instructions[this.instructionSize++] = instruction;
    }

    log()
    {
        this.instructions.length = this.instructionSize;
        // eslint-disable-next-line no-console
        console.table(this.instructions, ['type', 'action']);
    }

    lastInstruction()
    {
        return this.instructions[this.instructionSize - 1];
    }
}
