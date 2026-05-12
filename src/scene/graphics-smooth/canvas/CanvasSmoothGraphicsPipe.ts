import { ExtensionType } from '../../../extensions/Extensions';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Graphics } from '../../graphics/shared/Graphics';

/** @internal */
export class CanvasSmoothGraphicsPipe implements RenderPipe<Graphics>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'smoothGraphics',
    } as const;

    public renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    public validateRenderable(_graphics: Graphics): boolean
    {
        return false;
    }

    public addRenderable(graphics: Graphics, instructionSet: InstructionSet)
    {
        this.renderer.renderPipes.graphics.addRenderable(graphics, instructionSet)
    }

    public updateRenderable(_graphics: Graphics)
    {
        // no-op for canvas
    }

    public execute(graphics: Graphics)
    {
        this.renderer.renderPipes.graphics.execute(graphics);
    }

    public destroy()
    {
        this.renderer = null;
    }
}
