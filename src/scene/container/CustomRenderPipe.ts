import { ExtensionType } from '../../extensions/Extensions';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { InstructionPipe, RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { RenderContainer } from './RenderContainer';

const typeSymbol = Symbol.for('pixijs.CustomRenderPipe');

/**
 * The CustomRenderPipe is a render pipe that allows for custom rendering logic for your renderable objects.
 * @example
 * import { RenderContainer } from 'pixi.js';
 *
 * const renderContainer = new RenderContainer(
 * (renderer) =>  {
 *     renderer.clear({
 *       clearColor: 'green', // clear the screen to green when rendering this item
 *     });
 * })
 * @category rendering
 * @internal
 */
export class CustomRenderPipe implements InstructionPipe<RenderContainer>, RenderPipe<RenderContainer>
{
    /**
     * Type symbol used to identify instances of CustomRenderPipe.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a CustomRenderPipe.
     * @param obj - The object to check.
     * @returns True if the object is a CustomRenderPipe, false otherwise.
     */
    public static isCustomRenderPipe(obj: any): obj is CustomRenderPipe
    {
        return !!obj && !!obj[typeSymbol];
    }

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

    public updateRenderable() { /** empty */ }
    public destroyRenderable() { /** empty */ }
    public validateRenderable() { return false; }

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
