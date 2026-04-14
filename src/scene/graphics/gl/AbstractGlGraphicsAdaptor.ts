import { executeGlBatches } from '../shared/utils/executeGlBatches';

import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsAdaptor, GraphicsPipeLike } from '../shared/GraphicsAdaptorTypes';

/**
 * Base class for WebGL graphics adaptors.
 * Subclasses only need to implement `contextChange` for shader creation.
 * @category rendering
 * @internal
 */
export abstract class AbstractGlGraphicsAdaptor implements GraphicsAdaptor
{
    public shader: Shader;

    private readonly _contextSystemKey: string;

    constructor(contextSystemKey: string)
    {
        this._contextSystemKey = contextSystemKey;
    }

    public abstract contextChange(renderer: Renderer): void;

    public execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void
    {
        const context = renderable.context;
        const shader = context.customShader || this.shader;
        const renderer = graphicsPipe.renderer as WebGLRenderer;
        const contextSystem = (renderer as any)[this._contextSystemKey];

        const {
            batcher, instructions,
        } = contextSystem.getContextRenderData(context);

        executeGlBatches(renderer, shader, batcher, instructions, graphicsPipe.state);
    }

    public destroy(): void
    {
        this.shader.destroy(true);
        this.shader = null;
    }
}
