import { ExtensionType } from '../../extensions/Extensions';
import { executeInstructions } from './utils/executeInstructions';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { RenderGroup } from './RenderGroup';

export class RenderGroupPipe implements InstructionPipe<RenderGroup>
{
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'renderGroup',
    } as const;

    private _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public addRenderGroup(renderGroup: RenderGroup, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add(renderGroup);
    }

    public execute(renderGroup: RenderGroup)
    {
        if (!renderGroup.isRenderable) return;

        this._renderer.globalUniforms.push({
            worldTransformMatrix: renderGroup.worldTransform,
            worldColor: renderGroup.worldColorAlpha,
        });

        executeInstructions(renderGroup, this._renderer.renderPipes);

        this._renderer.globalUniforms.pop();

        // now render a quad..
    }

    public destroy(): void
    {
        this._renderer = null;
    }
}
