import type { InstructionPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { RenderPipes } from '../../../rendering/renderers/types';
import type { RenderGroup } from '../RenderGroup';

export function executeInstructions(renderGroup: RenderGroup, renderer: RenderPipes)
{
    const instructionSet = renderGroup.instructionSet;
    const instructions = instructionSet.instructions;

    for (let i = 0; i < instructionSet.instructionSize; i++)
    {
        const instruction = instructions[i];

        (renderer[instruction.renderPipeId as keyof RenderPipes] as InstructionPipe<any>).execute(instruction);
    }
}
