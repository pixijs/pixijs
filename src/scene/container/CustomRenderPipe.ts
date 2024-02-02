import { ExtensionType } from '../../extensions/Extensions';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { RenderContainer } from './RenderContainer';

export class CustomRenderPipe implements InstructionPipe<RenderContainer>
{
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'customRender',
    } as const;

    private _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public addRenderable(container: RenderContainer, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add(container);
    }

    public execute(container: RenderContainer)
    {
        if (!container.isRenderable) return;

        container.render(this._renderer);
    }

    public destroy(): void
    {
        this._renderer = null;
    }
}
