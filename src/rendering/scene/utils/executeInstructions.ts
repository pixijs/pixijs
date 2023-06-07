import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { RenderPipes } from '../../renderers/shared/system/SharedSystems';
import type { Renderer } from '../../renderers/types';
import type { LayerGroup } from '../LayerGroup';

export function executeInstructions(layerGroup: LayerGroup, renderer: Renderer['renderPipes'])
{
    const instructionSet = layerGroup.instructionSet;
    const instructions = instructionSet.instructions;

    for (let i = 0; i < instructionSet.instructionSize; i++)
    {
        const instruction = instructions[i];

        (renderer[instruction.type as keyof RenderPipes] as InstructionPipe<any>).execute(instruction);
    }
}
