import { ExtensionType } from '../extensions/Extensions';
import { Matrix } from '../maths/matrix/Matrix';
import { type Rectangle } from '../maths/shapes/Rectangle';
import { BindGroup } from '../rendering/renderers/gpu/shader/BindGroup';
import { Geometry } from '../rendering/renderers/shared/geometry/Geometry';
import { UniformGroup } from '../rendering/renderers/shared/shader/UniformGroup';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { TexturePool } from '../rendering/renderers/shared/texture/TexturePool';
import { type Renderer, RendererType } from '../rendering/renderers/types';
import { Bounds } from '../scene/container/bounds/Bounds';
import { getGlobalRenderableBounds } from '../scene/container/bounds/getRenderableBounds';
import { warn } from '../utils/logging/warn';

import type { WebGLRenderer } from '../rendering/renderers/gl/WebGLRenderer';
import type { WebGPURenderer } from '../rendering/renderers/gpu/WebGPURenderer';
import type { Instruction } from '../rendering/renderers/shared/instructions/Instruction';
import type { Renderable } from '../rendering/renderers/shared/Renderable';
import type { RenderTarget } from '../rendering/renderers/shared/renderTarget/RenderTarget';
import type { RenderSurface } from '../rendering/renderers/shared/renderTarget/RenderTargetSystem';
import type { System } from '../rendering/renderers/shared/system/System';
import type { Container } from '../scene/container/Container';
import type { Sprite } from '../scene/sprite/Sprite';
import type { Filter } from './Filter';
import type { FilterEffect } from './FilterEffect';

const quadGeometry = new Geometry({
    attributes: {
        aPosition: {
            buffer: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            format: 'float32x2',
            stride: 2 * 4,
            offset: 0,
        },
    },
    indexBuffer: new Uint32Array([0, 1, 2, 0, 2, 3]),
});

/**
 * The filter pipeline is responsible for applying filters scene items!
 *
 * KNOWN BUGS:
 * 1. Global bounds calculation is incorrect if it is used when flip flopping filters. The maths can be found below
 * eg: filters [noiseFilter, blurFilter] noiseFilter will calculate the global bounds incorrectly.
 *
 * 2. RenderGroups do not work with filters. This is because the renderGroup matrix is not currently taken into account.
 *
 * Implementation notes:
 * 1. Gotcha - nesting filters that require blending will not work correctly. This creates a chicken and egg problem
 * the complexity and performance required to do this is not worth it i feel.. but lets see if others agree!
 *
 * 2. Filters are designed to be changed on the fly, this is means that changing filter information each frame will
 * not trigger an instruction rebuild. If you are constantly turning a filter on and off.. its therefore better to set
 * enabled to true or false on the filter. Or setting an empty array.
 *
 * 3. Need to look at perhaps aliasing when flip flopping filters. Really we should only need to antialias the FIRST
 * Texture we render too. The rest can be non aliased. This might help performance.
 * Currently we flip flop with an antialiased texture if antialiasing is enabled on the filter.
 * @internal
 */
export interface FilterInstruction extends Instruction
{
    renderPipeId: 'filter',
    action: 'pushFilter' | 'popFilter',
    container?: Container,
    renderables?: Renderable[],
    filterEffect: FilterEffect,
}

/**
 * Class representing the data required for applying filters.
 * This class holds various properties that are used during the filter application process.
 * @internal
 */
class FilterData
{
    /**
     * Indicates whether the filter should be skipped.
     * @type {boolean}
     */
    public skip = false;

    /**
     * The texture to which the filter is applied.
     * @type {Texture}
     */
    public inputTexture: Texture = null;

    /**
     * The back texture used for blending, if required.
     * @type {Texture | null}
     */
    public backTexture?: Texture = null;

    /**
     * The list of filters to be applied.
     * @type {Filter[]}
     */
    public filters: Filter[] = null;

    /**
     * The bounds of the filter area.
     * @type {Bounds}
     */
    public bounds = new Bounds();

    /**
     * The container to which the filter is applied.
     * @type {Container}
     */
    public container: Container = null;

    /**
     * Indicates whether blending is required for the filter.
     * @type {boolean}
     */
    public blendRequired: boolean = false;

    /**
     * The render surface where the output of the filter is rendered.
     * @type {RenderSurface}
     */
    public outputRenderSurface: RenderSurface = null;

    /**
     * The global frame of the filter area.
     * @type {{ x: number, y: number, width: number, height: number }}
     */
    public globalFrame = { x: 0, y: 0, width: 0, height: 0 };

    /**
     * Indicates whether antialiasing is enabled for the filter.
     * @type {boolean}
     */
    public antialias: boolean;

    /**
     * The resolution of the filter.
     * @type {number}
     */
    public resolution: number;
}

/**
 * System that manages the filter pipeline
 * @category rendering
 * @advanced
 */
export class FilterSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'filter',
    } as const;

    public readonly renderer: Renderer;

    private _filterStackIndex = 0;
    private _filterStack: FilterData[] = [];

    private readonly _filterGlobalUniforms = new UniformGroup({
        uInputSize: { value: new Float32Array(4), type: 'vec4<f32>' },
        uInputPixel: { value: new Float32Array(4), type: 'vec4<f32>' },
        uInputClamp: { value: new Float32Array(4), type: 'vec4<f32>' },
        uOutputFrame: { value: new Float32Array(4), type: 'vec4<f32>' },
        uGlobalFrame: { value: new Float32Array(4), type: 'vec4<f32>' },
        uOutputTexture: { value: new Float32Array(4), type: 'vec4<f32>' },
    });

    private readonly _globalFilterBindGroup: BindGroup = new BindGroup({});
    private _activeFilterData: FilterData;

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    /**
     * The back texture of the currently active filter. Requires the filter to have `blendRequired` set to true.
     * @readonly
     */
    public get activeBackTexture(): Texture | undefined
    {
        return this._activeFilterData?.backTexture;
    }

    /**
     * Pushes a filter instruction onto the filter stack.
     * @param instruction - The instruction containing the filter effect and container.
     * @internal
     */
    public push(instruction: FilterInstruction)
    {
        const renderer = this.renderer;

        const filters = instruction.filterEffect.filters;

        // get a filter data from the stack. They can be reused multiple times each frame,
        // so we don't need to worry about overwriting them in a single pass.
        const filterData = this._pushFilterData();

        filterData.skip = false;

        filterData.filters = filters as Filter[];
        filterData.container = instruction.container;
        filterData.outputRenderSurface = renderer.renderTarget.renderSurface;

        const colorTextureSource = renderer.renderTarget.renderTarget.colorTexture.source;

        const rootResolution = colorTextureSource.resolution;
        const rootAntialias = colorTextureSource.antialias;

        // if there are no filters, we skip the pass
        if (filters.length === 0)
        {
            filterData.skip = true;

            return;
        }

        const bounds = filterData.bounds;

        this._calculateFilterArea(instruction, bounds);

        this._calculateFilterBounds(filterData, renderer.renderTarget.rootViewPort, rootAntialias, rootResolution, 1);

        if (filterData.skip)
        {
            return;
        }

        const previousFilterData = this._getPreviousFilterData();

        const globalResolution = this._findFilterResolution(rootResolution);
        let offsetX = 0;
        let offsetY = 0;

        if (previousFilterData)
        {
            offsetX = previousFilterData.bounds.minX;
            offsetY = previousFilterData.bounds.minY;
        }

        this._calculateGlobalFrame(
            filterData,
            offsetX, offsetY,
            globalResolution,
            colorTextureSource.width,
            colorTextureSource.height
        );

        // set all the filter data

        this._setupFilterTextures(filterData, bounds, renderer, previousFilterData);
    }

    /**
     * Applies filters to a texture.
     *
     * This method takes a texture and a list of filters, applies the filters to the texture,
     * and returns the resulting texture.
     * @param {object} params - The parameters for applying filters.
     * @param {Texture} params.texture - The texture to apply filters to.
     * @param {Filter[]} params.filters - The filters to apply.
     * @returns {Texture} The resulting texture after all filters have been applied.
     * @example
     *
     * ```ts
     * // Create a texture and a list of filters
     * const texture = new Texture(...);
     * const filters = [new BlurFilter(), new ColorMatrixFilter()];
     *
     * // Apply the filters to the texture
     * const resultTexture = filterSystem.applyToTexture({ texture, filters });
     *
     * // Use the resulting texture
     * sprite.texture = resultTexture;
     * ```
     *
     * Key Points:
     * 1. padding is not currently supported here - so clipping may occur with filters that use padding.
     * 2. If all filters are disabled or skipped, the original texture is returned.
     */
    public generateFilteredTexture({ texture, filters }: {texture: Texture, filters: Filter[]}): Texture
    {
        // get a filter data from the stack. They can be reused multiple times each frame,
        // so we don't need to worry about overwriting them in a single pass.
        const filterData = this._pushFilterData();

        this._activeFilterData = filterData;
        filterData.skip = false;

        filterData.filters = filters;

        const colorTextureSource = texture.source;

        const rootResolution = colorTextureSource.resolution;
        const rootAntialias = colorTextureSource.antialias;

        // if there are no filters, we skip the pass
        if (filters.length === 0)
        {
            filterData.skip = true;

            return texture;
        }

        const bounds = filterData.bounds;

        // this path is used by the blend modes mostly!
        // they collect all renderables and push them into a list.
        // this list is then used to calculate the bounds of the filter area

        bounds.addRect(texture.frame);

        this._calculateFilterBounds(filterData, bounds.rectangle, rootAntialias, rootResolution, 0);

        if (filterData.skip)
        {
            return texture;
        }

        const globalResolution = rootResolution;
        const offsetX = 0;
        const offsetY = 0;

        this._calculateGlobalFrame(
            filterData,
            offsetX, offsetY,
            globalResolution,
            colorTextureSource.width,
            colorTextureSource.height
        );

        /// /////////

        // set all the filter data
        // get a P02 texture from our pool...
        filterData.outputRenderSurface = TexturePool.getOptimalTexture(
            bounds.width,
            bounds.height,
            filterData.resolution,
            filterData.antialias,
        );

        filterData.backTexture = Texture.EMPTY;

        /// ///
        // bind...
        // TODO this might need looking at for padding!
        filterData.inputTexture = texture;

        /// ////////////// PART 2 POP //////////////////////

        const renderer = this.renderer;

        // TODO required? check with AA
        renderer.renderTarget.finishRenderPass();

        // get a BufferResource from the uniformBatch.
        // this will batch the shader uniform data and give us a buffer resource we can
        // set on our globalUniform Bind Group
        this._applyFiltersToTexture(filterData, true);

        const outputTexture = filterData.outputRenderSurface as Texture;

        outputTexture.source.alphaMode = 'premultiplied-alpha';

        return outputTexture;
    }

    /** @internal */
    public pop()
    {
        const renderer = this.renderer;

        const filterData = this._popFilterData();

        // if we are skipping this filter then we just do nothing :D
        if (filterData.skip)
        {
            return;
        }

        renderer.globalUniforms.pop();

        renderer.renderTarget.finishRenderPass();

        this._activeFilterData = filterData;

        this._applyFiltersToTexture(filterData, false);

        // if we made a background texture, lets return that also
        if (filterData.blendRequired)
        {
            TexturePool.returnTexture(filterData.backTexture);
        }

        // return the texture to the pool so we can reuse the next frame
        TexturePool.returnTexture(filterData.inputTexture);
    }

    /**
     * Copies the last render surface to a texture.
     * @param lastRenderSurface - The last render surface to copy from.
     * @param bounds - The bounds of the area to copy.
     * @param previousBounds - The previous bounds to use for offsetting the copy.
     */
    public getBackTexture(lastRenderSurface: RenderTarget, bounds: Bounds, previousBounds?: Bounds)
    {
        const backgroundResolution = lastRenderSurface.colorTexture.source._resolution;

        const backTexture = TexturePool.getOptimalTexture(
            bounds.width,
            bounds.height,
            backgroundResolution,
            false,
        );

        let x = bounds.minX;
        let y = bounds.minY;

        if (previousBounds)
        {
            x -= previousBounds.minX;
            y -= previousBounds.minY;
        }

        x = Math.floor(x * backgroundResolution);
        y = Math.floor(y * backgroundResolution);

        const width = Math.ceil(bounds.width * backgroundResolution);
        const height = Math.ceil(bounds.height * backgroundResolution);

        this.renderer.renderTarget.copyToTexture(
            lastRenderSurface,
            backTexture,
            { x, y },
            { width, height },
            { x: 0, y: 0 }
        );

        return backTexture;
    }

    /**
     * Applies a filter to a texture.
     * @param filter - The filter to apply.
     * @param input - The input texture.
     * @param output - The output render surface.
     * @param clear - Whether to clear the output surface before applying the filter.
     */
    public applyFilter(filter: Filter, input: Texture, output: RenderSurface, clear: boolean)
    {
        const renderer = this.renderer;

        const filterData = this._activeFilterData;

        const outputRenderSurface = filterData.outputRenderSurface;

        const isFinalTarget = outputRenderSurface === output;

        // Find the correct resolution by looking back through the filter stack
        const rootResolution = renderer.renderTarget.rootRenderTarget.colorTexture.source._resolution;
        const resolution = this._findFilterResolution(rootResolution);

        // Calculate the offset for both outputFrame and globalFrame
        let offsetX = 0;
        let offsetY = 0;

        if (isFinalTarget)
        {
            const offset = this._findPreviousFilterOffset();

            offsetX = offset.x;
            offsetY = offset.y;
        }

        this._updateFilterUniforms(input, output, filterData, offsetX, offsetY, resolution, isFinalTarget, clear);

        this._setupBindGroupsAndRender(filter, input, renderer);
    }

    /**
     * Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.
     *
     * Use `outputMatrix * vTextureCoord` in the shader.
     * @param outputMatrix - The matrix to output to.
     * @param {Sprite} sprite - The sprite to map to.
     * @returns The mapped matrix.
     */
    public calculateSpriteMatrix(outputMatrix: Matrix, sprite: Sprite): Matrix
    {
        const data = this._activeFilterData;

        const mappedMatrix = outputMatrix.set(
            data.inputTexture._source.width,
            0, 0,
            data.inputTexture._source.height,
            data.bounds.minX, data.bounds.minY
        );

        const worldTransform = sprite.worldTransform.copyTo(Matrix.shared);

        const renderGroup = sprite.renderGroup || sprite.parentRenderGroup;

        if (renderGroup && renderGroup.cacheToLocalTransform)
        {
            // get the matrix relative to the render group..
            worldTransform.prepend(renderGroup.cacheToLocalTransform);
        }

        worldTransform.invert();
        mappedMatrix.prepend(worldTransform);
        mappedMatrix.scale(
            1.0 / sprite.texture.frame.width,
            1.0 / sprite.texture.frame.height
        );

        mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

        return mappedMatrix;
    }

    public destroy(): void
    {
        // BOOM!
    }

    /**
     * Sets up the bind groups and renders the filter.
     * @param filter - The filter to apply
     * @param input - The input texture
     * @param renderer - The renderer instance
     */
    private _setupBindGroupsAndRender(filter: Filter, input: Texture, renderer: Renderer): void
    {
        // TODO - should prolly use a adaptor...
        if ((renderer as WebGPURenderer).renderPipes.uniformBatch)
        {
            const batchUniforms = (renderer as WebGPURenderer).renderPipes.uniformBatch
                .getUboResource(this._filterGlobalUniforms);

            this._globalFilterBindGroup.setResource(batchUniforms, 0);
        }
        else
        {
            this._globalFilterBindGroup.setResource(this._filterGlobalUniforms, 0);
        }

        // now lets update the output texture...

        // set bind group..
        this._globalFilterBindGroup.setResource(input.source, 1);
        this._globalFilterBindGroup.setResource(input.source.style, 2);

        filter.groups[0] = this._globalFilterBindGroup;

        renderer.encoder.draw({
            geometry: quadGeometry,
            shader: filter,
            state: filter._state,
            topology: 'triangle-list'
        });

        // WebGPU blit's automatically, but WebGL does not!
        if (renderer.type === RendererType.WEBGL)
        {
            renderer.renderTarget.finishRenderPass();
        }
    }

    /**
     * Sets up the filter textures including input texture and back texture if needed.
     * @param filterData - The filter data to update
     * @param bounds - The bounds for the texture
     * @param renderer - The renderer instance
     * @param previousFilterData - The previous filter data for back texture calculation
     */
    private _setupFilterTextures(
        filterData: FilterData,
        bounds: Bounds,
        renderer: Renderer,
        previousFilterData: FilterData | null
    ): void
    {
        // set all the filter data
        filterData.backTexture = Texture.EMPTY;

        if (filterData.blendRequired)
        {
            renderer.renderTarget.finishRenderPass();
            // this actually forces the current commandQueue to render everything so far.
            // if we don't do this, we won't be able to copy pixels for the background
            const renderTarget = renderer.renderTarget.getRenderTarget(filterData.outputRenderSurface);

            filterData.backTexture = this.getBackTexture(renderTarget, bounds, previousFilterData?.bounds);
        }

        /// ///
        // bind...
        // get a P02 texture from our pool...
        filterData.inputTexture = TexturePool.getOptimalTexture(
            bounds.width,
            bounds.height,
            filterData.resolution,
            filterData.antialias,
        );

        renderer.renderTarget.bind(filterData.inputTexture, true);
        // set the global uniforms to take into account the bounds offset required

        renderer.globalUniforms.push({
            offset: bounds,
        });
    }

    /**
     * Calculates and sets the global frame for the filter.
     * @param filterData - The filter data to update
     * @param offsetX - The X offset
     * @param offsetY - The Y offset
     * @param globalResolution - The global resolution
     * @param sourceWidth - The source texture width
     * @param sourceHeight - The source texture height
     */
    private _calculateGlobalFrame(
        filterData: FilterData,
        offsetX: number,
        offsetY: number,
        globalResolution: number,
        sourceWidth: number,
        sourceHeight: number
    ): void
    {
        const globalFrame = filterData.globalFrame;

        globalFrame.x = offsetX * globalResolution;
        globalFrame.y = offsetY * globalResolution;
        globalFrame.width = sourceWidth * globalResolution;
        globalFrame.height = sourceHeight * globalResolution;
    }

    /**
     * Updates the filter uniforms with the current filter state.
     * @param input - The input texture
     * @param output - The output render surface
     * @param filterData - The current filter data
     * @param offsetX - The X offset for positioning
     * @param offsetY - The Y offset for positioning
     * @param resolution - The current resolution
     * @param isFinalTarget - Whether this is the final render target
     * @param clear - Whether to clear the output surface
     */
    private _updateFilterUniforms(
        input: Texture,
        output: RenderSurface,
        filterData: FilterData,
        offsetX: number,
        offsetY: number,
        resolution: number,
        isFinalTarget: boolean,
        clear: boolean
    ): void
    {
        const uniforms = this._filterGlobalUniforms.uniforms;
        const outputFrame = uniforms.uOutputFrame;
        const inputSize = uniforms.uInputSize;
        const inputPixel = uniforms.uInputPixel;
        const inputClamp = uniforms.uInputClamp;
        const globalFrame = uniforms.uGlobalFrame;
        const outputTexture = uniforms.uOutputTexture;

        // are we rendering back to the original surface?
        if (isFinalTarget)
        {
            outputFrame[0] = filterData.bounds.minX - offsetX;
            outputFrame[1] = filterData.bounds.minY - offsetY;
        }
        else
        {
            outputFrame[0] = 0;
            outputFrame[1] = 0;
        }

        outputFrame[2] = input.frame.width;
        outputFrame[3] = input.frame.height;

        inputSize[0] = input.source.width;
        inputSize[1] = input.source.height;
        inputSize[2] = 1 / inputSize[0];
        inputSize[3] = 1 / inputSize[1];

        inputPixel[0] = input.source.pixelWidth;
        inputPixel[1] = input.source.pixelHeight;
        inputPixel[2] = 1.0 / inputPixel[0];
        inputPixel[3] = 1.0 / inputPixel[1];

        inputClamp[0] = 0.5 * inputPixel[2];
        inputClamp[1] = 0.5 * inputPixel[3];
        inputClamp[2] = (input.frame.width * inputSize[2]) - (0.5 * inputPixel[2]);
        inputClamp[3] = (input.frame.height * inputSize[3]) - (0.5 * inputPixel[3]);

        const rootTexture = this.renderer.renderTarget.rootRenderTarget.colorTexture;

        globalFrame[0] = offsetX * resolution;
        globalFrame[1] = offsetY * resolution;
        globalFrame[2] = rootTexture.source.width * resolution;
        globalFrame[3] = rootTexture.source.height * resolution;

        // we are going to overwrite resource we can set it to null!
        if (output instanceof Texture) output.source.resource = null;

        // set the output texture - this is where we are going to render to
        const renderTarget = this.renderer.renderTarget.getRenderTarget(output);

        this.renderer.renderTarget.bind(output, !!clear);

        if (output instanceof Texture)
        {
            outputTexture[0] = output.frame.width;
            outputTexture[1] = output.frame.height;
        }
        else
        {
            // this means a renderTarget was passed directly
            outputTexture[0] = renderTarget.width;
            outputTexture[1] = renderTarget.height;
        }

        outputTexture[2] = renderTarget.isRoot ? -1 : 1;

        this._filterGlobalUniforms.update();
    }

    /**
     * Finds the correct resolution by looking back through the filter stack.
     * @param rootResolution - The fallback root resolution to use
     * @returns The resolution from the previous filter or root resolution
     */
    private _findFilterResolution(rootResolution: number): number
    {
        let currentIndex = this._filterStackIndex - 1;

        while (currentIndex > 0 && this._filterStack[currentIndex].skip)
        {
            --currentIndex;
        }

        return currentIndex > 0 && this._filterStack[currentIndex].inputTexture
            ? this._filterStack[currentIndex].inputTexture.source._resolution
            : rootResolution;
    }

    /**
     * Finds the offset from the previous non-skipped filter in the stack.
     * @returns The offset coordinates from the previous filter
     */
    private _findPreviousFilterOffset(): { x: number, y: number }
    {
        let offsetX = 0;
        let offsetY = 0;
        let lastIndex = this._filterStackIndex;

        while (lastIndex > 0)
        {
            lastIndex--;
            const prevFilterData = this._filterStack[lastIndex];

            if (!prevFilterData.skip)
            {
                offsetX = prevFilterData.bounds.minX;
                offsetY = prevFilterData.bounds.minY;
                break;
            }
        }

        return { x: offsetX, y: offsetY };
    }

    /**
     * Calculates the filter area bounds based on the instruction type.
     * @param instruction - The filter instruction
     * @param bounds - The bounds object to populate
     */
    private _calculateFilterArea(instruction: FilterInstruction, bounds: Bounds): void
    {
        // this path is used by the blend modes mostly!
        // they collect all renderables and push them into a list.
        // this list is then used to calculate the bounds of the filter area
        if (instruction.renderables)
        {
            getGlobalRenderableBounds(instruction.renderables, bounds);
        }
        // if a filterArea is provided, we save our selves some measuring and just use that area supplied
        else if (instruction.filterEffect.filterArea)
        {
            bounds.clear();

            // transform the filterArea into global space..
            bounds.addRect(instruction.filterEffect.filterArea);

            // new for v8, we transform the bounds into the space of the container
            bounds.applyMatrix(instruction.container.worldTransform);
        }
        // classic filter path, we get the bounds of the container and use it by recursively
        // measuring.
        else
        {
            // we want to factor render layers to get the real visual bounds of this container.
            // so the last param is true..
            instruction.container.getFastGlobalBounds(true, bounds);
        }

        if (instruction.container)
        {
            // When a container is cached as a texture, its filters need to be applied relative to its
            // cached parent's coordinate space rather than world space. This transform adjustment ensures
            // filters are applied in the correct coordinate system.
            const renderGroup = instruction.container.renderGroup || instruction.container.parentRenderGroup;
            const filterFrameTransform = renderGroup.cacheToLocalTransform;

            if (filterFrameTransform)
            {
                bounds.applyMatrix(filterFrameTransform);
            }
        }
    }

    private _applyFiltersToTexture(filterData: FilterData, clear: boolean)
    {
        const inputTexture = filterData.inputTexture;

        const bounds = filterData.bounds;

        const filters = filterData.filters;

        // get a BufferResource from the uniformBatch.
        // this will batch the shader uniform data and give us a buffer resource we can
        // set on our globalUniform Bind Group

        // update the resources on the bind group...
        this._globalFilterBindGroup.setResource(inputTexture.source.style, 2);
        this._globalFilterBindGroup.setResource(filterData.backTexture.source, 3);

        if (filters.length === 1)
        {
            // render a single filter...
            filters[0].apply(this, inputTexture, filterData.outputRenderSurface, clear);
        }
        else
        {
            let flip = filterData.inputTexture;

            const tempTexture = TexturePool.getOptimalTexture(
                bounds.width,
                bounds.height,
                flip.source._resolution,
                false
            );

            // get another texture that we will render the next filter too
            let flop = tempTexture;

            let i = 0;

            // loop and apply the filters, omitting the last one as we will render that to the final target
            for (i = 0; i < filters.length - 1; ++i)
            {
                const filter = filters[i];

                filter.apply(this, flip, flop, true);
                const t = flip;

                flip = flop;
                flop = t;
            }

            filters[i].apply(this, flip, filterData.outputRenderSurface, clear);

            // return those textures for later!
            TexturePool.returnTexture(tempTexture);
        }
    }

    private _calculateFilterBounds(
        filterData: FilterData,
        viewPort: Rectangle,
        rootAntialias: boolean,
        rootResolution: number,
        // a multiplier padding for the bounds calculation
        // this prop is used when applying filters to textures
        // as the should have padding applied to them already (until we fix padding when applying them to textures)
        // set to 0 to remove padding from the bounds calculation
        paddingMultiplier: number
    )
    {
        const renderer = this.renderer;

        const bounds = filterData.bounds;
        const filters = filterData.filters;

        // get GLOBAL bounds of the item we are going to apply the filter to

        // next we get the settings for the filter
        // we need to find the LOWEST resolution for the filter list
        let resolution = Infinity;
        // Padding is additive to add padding to our padding
        let padding = 0;
        // if this is true for all filter, it should be true, and otherwise false
        let antialias = true;
        // true if any filter requires the previous render target
        let blendRequired = false;
        // true if any filter in the list is enabled
        let enabled = false;
        // false if any filter in the list has false
        let clipToViewport = true;

        for (let i = 0; i < filters.length; i++)
        {
            const filter = filters[i];

            resolution = Math.min(resolution, filter.resolution === 'inherit'
                ? rootResolution : filter.resolution);
            padding += filter.padding;

            if (filter.antialias === 'off')
            {
                antialias = false;
            }
            else if (filter.antialias === 'inherit')
            {
                antialias &&= rootAntialias;
            }

            if (!filter.clipToViewport)
            {
                clipToViewport = false;
            }

            const isCompatible = !!(filter.compatibleRenderers & renderer.type);

            if (!isCompatible)
            {
                enabled = false;
                break;
            }

            if (filter.blendRequired && !((renderer as WebGLRenderer).backBuffer?.useBackBuffer ?? true))
            {
                // #if _DEBUG
                // eslint-disable-next-line max-len
                warn('Blend filter requires backBuffer on WebGL renderer to be enabled. Set `useBackBuffer: true` in the renderer options.');
                // #endif

                enabled = false;
                break;
            }

            enabled = filter.enabled || enabled;
            blendRequired ||= filter.blendRequired;
        }

        // if no filters are enabled lets skip!
        if (!enabled)
        {
            filterData.skip = true;

            return;
        }

        // here we constrain the bounds to the viewport we will render too
        // this should not take into account the x, y offset of the viewport - as this is
        // handled by the viewport on the gpu.
        if (clipToViewport)
        {
            bounds.fitBounds(0, viewPort.width / rootResolution, 0, viewPort.height / rootResolution);
        }

        // round the bounds to the nearest pixel
        bounds
            .scale(resolution)
            .ceil()
            .scale(1 / resolution)
            .pad((padding | 0) * paddingMultiplier);

        // skip if the bounds are negative or zero as this means they are
        // not visible on the screen
        if (!bounds.isPositive)
        {
            filterData.skip = true;

            return;
        }

        // set the global frame to the root texture

        // get previous bounds.. we must take into account skipped filters also..

        // // to find the previous resolution we need to account for the skipped filters
        // // the following will find the last non skipped filter...

        // store the values that will be used to apply the filters
        filterData.antialias = antialias;
        filterData.resolution = resolution;
        filterData.blendRequired = blendRequired;
    }

    private _popFilterData(): FilterData
    {
        this._filterStackIndex--;

        return this._filterStack[this._filterStackIndex];
    }

    private _getPreviousFilterData(): FilterData | null
    {
        let previousFilterData: FilterData;

        let index = this._filterStackIndex - 1;

        while (index > 1)
        {
            index--;
            previousFilterData = this._filterStack[index];

            if (!previousFilterData.skip)
            {
                break;
            }
        }

        return previousFilterData;
    }

    private _pushFilterData(): FilterData
    {
        let filterData = this._filterStack[this._filterStackIndex];

        if (!filterData)
        {
            filterData = this._filterStack[this._filterStackIndex] = new FilterData();
        }

        this._filterStackIndex++;

        return filterData;
    }
}

