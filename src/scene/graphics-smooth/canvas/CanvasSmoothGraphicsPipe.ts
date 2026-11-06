import { ExtensionType } from '../../../extensions/Extensions';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Graphics } from '../../graphics/shared/Graphics';

/**
 * Renders {@link SmoothGraphics} like a regular {@link Graphics} on the canvas renderer.
 * @internal
 */
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

    public validateRenderable(graphics: Graphics): boolean
    {
        return this.renderer.renderPipes.graphics.validateRenderable(graphics);
    }

    public addRenderable(graphics: Graphics, instructionSet: InstructionSet)
    {
        this.renderer.renderPipes.graphics.addRenderable(graphics, instructionSet);
    }

    public updateRenderable(graphics: Graphics)
    {
        this.renderer.renderPipes.graphics.updateRenderable(graphics);
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
