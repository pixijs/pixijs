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
        name: 'layer',
    } as const;

    private _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public addLayerGroup(layerGroup: RenderGroup, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add(layerGroup);
    }

    public execute(layerGroup: RenderGroup)
    {
        if (!layerGroup.isRenderable) return;

        this._renderer.globalUniforms.push({
            worldTransformMatrix: layerGroup.worldTransform,
            worldColor: layerGroup.worldColorAlpha,
        });

        executeInstructions(layerGroup, this._renderer.renderPipes);

        this._renderer.globalUniforms.pop();

        // now render a quad..
    }

    public destroy(): void
    {
        this._renderer = null;
    }
}
