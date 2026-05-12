import { executeGpuBatches } from '../shared/utils/executeGpuBatches';

import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsAdaptor, GraphicsPipeLike } from '../shared/GraphicsAdaptorTypes';

/**
 * Base class for WebGPU graphics adaptors.
 * Subclasses only need to implement `contextChange` for shader creation.
 * @category rendering
 * @internal
 */
export abstract class AbstractGpuGraphicsAdaptor implements GraphicsAdaptor
{
    public shader: Shader;

    protected _maxTextures = 0;

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
        const renderer = graphicsPipe.renderer as WebGPURenderer;
        const contextSystem = (renderer as any)[this._contextSystemKey];

        const {
            batcher, instructions,
        } = contextSystem.getContextRenderData(context);

        executeGpuBatches(renderer, shader, batcher, instructions, graphicsPipe.state, this._maxTextures);
    }

    public destroy(): void
    {
        this.shader.destroy(true);
        this.shader = null;
    }
}
