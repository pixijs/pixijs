import { ExtensionType } from '../extensions/Extensions';
import { Matrix } from '../maths/matrix/Matrix';
import { Point } from '../maths/point/Point';
import { BindGroup } from '../rendering/renderers/gpu/shader/BindGroup';
import { Geometry } from '../rendering/renderers/shared/geometry/Geometry';
import { UniformGroup } from '../rendering/renderers/shared/shader/UniformGroup';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { TexturePool } from '../rendering/renderers/shared/texture/TexturePool';
import { type Renderer, RendererType } from '../rendering/renderers/types';
import { Bounds } from '../scene/container/bounds/Bounds';
import { getFastGlobalBounds } from '../scene/container/bounds/getFastGlobalBounds';
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

type FilterAction = 'pushFilter' | 'popFilter';

//
const quadGeometry = new Geometry({
    attributes: {
        aPosition: {
            buffer: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            location: 0,
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
 */
export interface FilterInstruction extends Instruction
{
    renderPipeId: 'filter',
    action: FilterAction,
    container?: Container,
    renderables?: Renderable[],
    filterEffect: FilterEffect,
}

export interface FilterData
{
    skip: boolean;
    enabledLength?: number;
    inputTexture: Texture
    bounds: Bounds,
    blendRequired: boolean,
    container: Container,
    filterEffect: FilterEffect,
    previousRenderSurface: RenderSurface,
    backTexture?: Texture,
}

/**
 * System that manages the filter pipeline
 * @memberof rendering
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

    public push(instruction: FilterInstruction)
    {
        const renderer = this.renderer;

        const filters = instruction.filterEffect.filters;

        if (!this._filterStack[this._filterStackIndex])
        {
            this._filterStack[this._filterStackIndex] = this._getFilterData();
        }

        // get a filter data from the stack. They can be reused multiple times each frame,
        // so we don't need to worry about overwriting them in a single pass.
        const filterData = this._filterStack[this._filterStackIndex];

        this._filterStackIndex++;

        // if there are no filters, we skip the pass
        if (filters.length === 0)
        {
            filterData.skip = true;

            return;
        }

        const bounds: Bounds = filterData.bounds;

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
            getFastGlobalBounds(instruction.container, bounds);
        }
        // get GLOBAL bounds of the item we are going to apply the filter to

        const colorTextureSource = renderer.renderTarget.rootRenderTarget.colorTexture.source;

        // next we get the settings for the filter
        // we need to find the LOWEST resolution for the filter list
        let resolution = colorTextureSource._resolution;

        // Padding is additive to add padding to our padding
        let padding = 0;
        // if this is true for any filter, it should be true
        let antialias = colorTextureSource.antialias;
        // true if any filter requires the previous render target
        let blendRequired = false;
        // true if any filter in the list is enabled
        let enabled = false;

        for (let i = 0; i < filters.length; i++)
        {
            const filter = filters[i];

            resolution = Math.min(resolution, filter.resolution);
            padding += filter.padding;

            if (filter.antialias !== 'inherit')
            {
                if (filter.antialias === 'on')
                {
                    antialias = true;
                }
                else
                {
                    antialias = false;
                }
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
            blendRequired = blendRequired || filter.blendRequired;
        }

        // if no filters are enabled lets skip!
        if (!enabled)
        {
            filterData.skip = true;

            return;
        }

        const viewPort = renderer.renderTarget.rootViewPort;

        // here we constrain the bounds to the viewport we will render too
        // this should not take into account the x, y offset of the viewport - as this is
        // handled by the viewport on the gpu.
        // need to factor in resolutions also..
        bounds.scale(resolution)
            .fitBounds(0, viewPort.width, 0, viewPort.height)
            .scale(1 / resolution)
            .pad(padding)
            .ceil();

        // skip if the bounds are negative or zero as this means they are
        // not visible on the screen
        if (!bounds.isPositive)
        {
            filterData.skip = true;

            return;
        }

        // set all the filter data
        filterData.skip = false;

        filterData.bounds = bounds;
        filterData.blendRequired = blendRequired;
        filterData.container = instruction.container;
        filterData.filterEffect = instruction.filterEffect;

        filterData.previousRenderSurface = renderer.renderTarget.renderSurface;

        // bind...
        // get a P02 texture from our pool...
        filterData.inputTexture = TexturePool.getOptimalTexture(
            bounds.width,
            bounds.height,
            resolution,
            antialias,
        );

        renderer.renderTarget.bind(filterData.inputTexture, true);
        // set the global uniforms to take into account the bounds offset required

        renderer.globalUniforms.push({
            offset: bounds,
        });
    }

    public pop()
    {
        const renderer = this.renderer;

        this._filterStackIndex--;
        const filterData = this._filterStack[this._filterStackIndex];

        // if we are skipping this filter then we just do nothing :D
        if (filterData.skip)
        {
            return;
        }

        this._activeFilterData = filterData;

        const inputTexture = filterData.inputTexture;

        const bounds = filterData.bounds;

        let backTexture = Texture.EMPTY;

        renderer.renderTarget.finishRenderPass();

        if (filterData.blendRequired)
        {
            // this actually forces the current commandQueue to render everything so far.
            // if we don't do this, we won't be able to copy pixels for the background
            const previousBounds = this._filterStackIndex > 0 ? this._filterStack[this._filterStackIndex - 1].bounds : null;

            const renderTarget = renderer.renderTarget.getRenderTarget(filterData.previousRenderSurface);

            backTexture = this.getBackTexture(renderTarget, bounds, previousBounds);
        }

        filterData.backTexture = backTexture;

        const filters = filterData.filterEffect.filters;

        // get a BufferResource from the uniformBatch.
        // this will batch the shader uniform data and give us a buffer resource we can
        // set on our globalUniform Bind Group
        // eslint-disable-next-line max-len

        // update the resources on the bind group...
        this._globalFilterBindGroup.setResource(inputTexture.source.style, 2);
        this._globalFilterBindGroup.setResource(backTexture.source, 3);

        renderer.globalUniforms.pop();

        if (filters.length === 1)
        {
            // render a single filter...
            // this.applyFilter(filters[0], inputTexture, filterData.previousRenderSurface, false);
            filters[0].apply(this, inputTexture, filterData.previousRenderSurface, false);

            // return the texture to the pool so we can reuse the next frame
            TexturePool.returnTexture(inputTexture);
        }
        else
        {
            let flip = filterData.inputTexture;

            // get another texture that we will render the next filter too
            let flop = TexturePool.getOptimalTexture(
                bounds.width,
                bounds.height,
                flip.source._resolution,
                false
            );

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

            filters[i].apply(this, flip, filterData.previousRenderSurface, false);

            // return those textures for later!
            TexturePool.returnTexture(flip);
            TexturePool.returnTexture(flop);
        }

        // if we made a background texture, lets return that also
        if (filterData.blendRequired)
        {
            TexturePool.returnTexture(backTexture);
        }
    }

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

    public applyFilter(filter: Filter, input: Texture, output: RenderSurface, clear: boolean)
    {
        const renderer = this.renderer;

        const filterData = this._filterStack[this._filterStackIndex];

        const bounds = filterData.bounds;

        const offset = Point.shared;
        const previousRenderSurface = filterData.previousRenderSurface;

        const isFinalTarget = previousRenderSurface === output;

        let resolution = this.renderer.renderTarget.rootRenderTarget.colorTexture.source._resolution;

        // to find the previous resolution we need to account for the skipped filters
        // the following will find the last non skipped filter...
        let currentIndex = this._filterStackIndex - 1;

        while (currentIndex > 0 && this._filterStack[currentIndex].skip)
        {
            --currentIndex;
        }

        if (currentIndex > 0)
        {
            resolution = this._filterStack[currentIndex].inputTexture.source._resolution;
        }

        const filterUniforms = this._filterGlobalUniforms;
        const uniforms = filterUniforms.uniforms;

        const outputFrame = uniforms.uOutputFrame;
        const inputSize = uniforms.uInputSize;
        const inputPixel = uniforms.uInputPixel;
        const inputClamp = uniforms.uInputClamp;
        const globalFrame = uniforms.uGlobalFrame;
        const outputTexture = uniforms.uOutputTexture;

        // are we rendering back to the original surface?
        if (isFinalTarget)
        {
            let lastIndex = this._filterStackIndex;

            // get previous bounds.. we must take into account skipped filters also..
            while (lastIndex > 0)
            {
                lastIndex--;
                const filterData = this._filterStack[this._filterStackIndex - 1];

                if (!filterData.skip)
                {
                    offset.x = filterData.bounds.minX;
                    offset.y = filterData.bounds.minY;

                    break;
                }
            }

            outputFrame[0] = bounds.minX - offset.x;
            outputFrame[1] = bounds.minY - offset.y;
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

        globalFrame[0] = offset.x * resolution;
        globalFrame[1] = offset.y * resolution;

        globalFrame[2] = rootTexture.source.width * resolution;
        globalFrame[3] = rootTexture.source.height * resolution;

        // set the output texture - this is where we are going to render to

        const renderTarget = this.renderer.renderTarget.getRenderTarget(output);

        renderer.renderTarget.bind(output, !!clear);

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
        filterUniforms.update();

        // TODO - should prolly use a adaptor...
        if ((renderer as WebGPURenderer).renderPipes.uniformBatch)
        {
            const batchUniforms = (renderer as WebGPURenderer).renderPipes.uniformBatch
                .getUboResource(filterUniforms);

            this._globalFilterBindGroup.setResource(batchUniforms, 0);
        }
        else
        {
            this._globalFilterBindGroup.setResource(filterUniforms, 0);
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

    private _getFilterData(): FilterData
    {
        return {
            skip: false,
            inputTexture: null,
            bounds: new Bounds(),
            container: null,
            filterEffect: null,
            blendRequired: false,
            previousRenderSurface: null,
        };
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

        worldTransform.invert();
        mappedMatrix.prepend(worldTransform);
        mappedMatrix.scale(
            1.0 / sprite.texture.frame.width,
            1.0 / sprite.texture.frame.height
        );

        mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

        return mappedMatrix;
    }

    public destroy?: () => void;
}
