import type { Batch } from '../../../rendering/batcher/shared/Batcher';
import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Renderer } from '../../../rendering/renderers/types';
import type { AbstractGraphicsContextRenderData } from '../shared/AbstractGraphicsContextSystem';
import type { GraphicsAdaptor, GraphicsPipeLike } from '../shared/AbstractGraphicsPipe';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsContext } from '../shared/GraphicsContext';

/**
 * WebGL adaptor shared by {@link Graphics} and {@link SmoothGraphics}: draws a context that isn't batched.
 * Subclasses create the shader and give access to the render data of a context.
 * @category rendering
 * @ignore
 */
export abstract class AbstractGlGraphicsAdaptor<
    TRenderData extends AbstractGraphicsContextRenderData = AbstractGraphicsContextRenderData,
> implements GraphicsAdaptor
{
    public shader: Shader;

    public abstract contextChange(renderer: Renderer): void;

    /**
     * Returns the render data of a context that isn't batched.
     * @param renderer - The renderer
     * @param context - The context
     */
    protected abstract _getRenderData(renderer: WebGLRenderer, context: GraphicsContext): TRenderData;

    /**
     * Returns the shader used when the context has no custom shader.
     * @param _renderData - The render data of the context
     */
    protected _getShader(_renderData: TRenderData): Shader
    {
        return this.shader;
    }

    public execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void
    {
        const context = renderable.context;
        const renderer = graphicsPipe.renderer as WebGLRenderer;
        const renderData = this._getRenderData(renderer, context);
        const { batcher, instructions } = renderData;
        const shader = context.customShader || this._getShader(renderData);

        // WebGL specific..
        shader.groups[0] = renderer.globalUniforms.bindGroup;

        renderer.state.set(graphicsPipe.state);

        renderer.shader.bind(shader);

        renderer.geometry.bind(batcher.geometry, shader.glProgram);

        const batches = instructions.instructions as Batch[];

        for (let i = 0; i < instructions.instructionSize; i++)
        {
            const batch = batches[i];

            if (batch.size)
            {
                for (let j = 0; j < batch.textures.count; j++)
                {
                    renderer.texture.bind(batch.textures.textures[j], j);
                }

                // the batch shader declares float samplers on every unit, so none may be left holding an integer texture
                renderer.texture.unbindIntegerTextures(batch.textures.count);

                renderer.geometry.draw(batch.topology, batch.size, batch.start);
            }
        }
    }

    public destroy(): void
    {
        this.shader.destroy(true);
        this.shader = null;
    }
}
