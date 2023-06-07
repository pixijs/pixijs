import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { Point } from '../../../maths/Point';
import { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import { Geometry } from '../../renderers/shared/geometry/Geometry';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { Texture } from '../../renderers/shared/texture/Texture';
import { TexturePool } from '../../renderers/shared/texture/TexturePool';
import { Bounds } from '../../scene/bounds/Bounds';
import { getGlobalBounds } from '../../scene/bounds/getGlobalBounds';
import { getGlobalRenderableBounds } from '../../scene/bounds/getRenderableBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { PointData } from '../../../maths/PointData';
import type { RenderSurface } from '../../renderers/gpu/renderTarget/GpuRenderTargetSystem';
import type { BindResource } from '../../renderers/gpu/shader/BindResource';
import type { GPURenderPipes } from '../../renderers/gpu/WebGPUSystems';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { RenderTarget } from '../../renderers/shared/renderTarget/RenderTarget';
import type { ISystem } from '../../renderers/shared/system/ISystem';
import type { Renderer } from '../../renderers/types';
import type { Container } from '../../scene/Container';
import type { Sprite } from '../../sprite/shared/Sprite';
import type { Filter } from '../Filter';
import type { FilterEffect } from '../FilterEffect';

type FilterAction = 'pushFilter' | 'popFilter';

//
const quadGeometry = new Geometry({
    attributes: {
        aPosition: {
            buffer: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            shaderLocation: 0,
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
    type: 'filter',
    action: FilterAction,
    container?: Container,
    renderables?: Renderable[],
    filterEffect: FilterEffect,
}

export interface FilterData
{
    skip: boolean;
    inputTexture: Texture
    bounds: Bounds,
    blendRequired: boolean,
    container: Container,
    filterEffect: FilterEffect,
    previousRenderSurface: RenderTarget,
}

// eslint-disable-next-line max-len
export class FilterSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererSystem,
            ExtensionType.WebGPURendererSystem,
        ],
        name: 'filter',
    };

    private filterStackIndex = 0;
    private filterStack: FilterData[] = [];

    private renderer: Renderer;

    private filterGlobalUniforms = new UniformGroup({
        inputSize: { value: new Float32Array(4), type: 'vec4<f32>' },
        inputPixel: { value: new Float32Array(4), type: 'vec4<f32>' },
        inputClamp: { value: new Float32Array(4), type: 'vec4<f32>' },
        outputFrame: { value: new Float32Array(4), type: 'vec4<f32>' },
        backgroundFrame: { value: new Float32Array(4), type: 'vec4<f32>' },
        globalFrame: { value: new Float32Array(4), type: 'vec4<f32>' },
    });

    private globalFilterBindGroup: BindGroup = new BindGroup({});
    private activeFilterData: FilterData;

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    push(instruction: FilterInstruction)
    {
        const renderer = this.renderer;

        const filters = instruction.filterEffect.filters;

        if (!this.filterStack[this.filterStackIndex])
        {
            this.filterStack[this.filterStackIndex] = this.getFilterData();
        }

        // get a filter data from the stack. They can be reused multiple times each frame,
        // so we don't need to worry about overwriting them in a single pass.
        const filterData = this.filterStack[this.filterStackIndex];

        this.filterStackIndex++;

        const bounds: Bounds = filterData.bounds;

        if (instruction.renderables)
        {
            getGlobalRenderableBounds(instruction.renderables, bounds);
        }
        else
        {
            getGlobalBounds(instruction.container, true, bounds);
        }
        // get GLOBAL bounds of the item we are going to apply the filter to

        // if there are no filters, we skip the pass
        if (filters.length === 0)
        {
            filterData.skip = true;

            return;
        }

        // next we get the settings for the filter
        // we need to find the LOWEST resolution for the filter list
        let resolution = renderer.renderTarget.rootRenderTarget.colorTexture.source._resolution;

        // Padding is additive to add padding to our padding
        let padding = 0;
        // if this is true for any filter, it should be true
        let antialias = renderer.renderTarget.rootRenderTarget.colorTexture.source.antialias;
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

            enabled = filter.enabled || enabled;
            blendRequired = blendRequired || filter.blendRequired;
        }

        // if no filters are enabled lets skip!
        if (!enabled)
        {
            filterData.skip = true;

            return;
        }

        // her we constrain the bounds to the viewport we will render too
        // need to factor in resolutions also..
        bounds.scale(resolution)
            .fit(renderer.renderTarget.rootRenderTarget.viewport)
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

        filterData.previousRenderSurface = renderer.renderTarget.renderTarget;

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

    pop()
    {
        const renderer = this.renderer;

        this.filterStackIndex--;
        const filterData = this.filterStack[this.filterStackIndex];

        // if we are skipping this filter then we just do nothing :D
        if (filterData.skip)
        {
            return;
        }

        this.activeFilterData = filterData;

        const inputTexture = filterData.inputTexture;

        const bounds = filterData.bounds;

        let backTexture = Texture.EMPTY;

        if (filterData.blendRequired)
        {
            // this actually forces the current commandQueue to render everything so far.
            // if we don't do this, we won't be able to copy pixels for the background

            renderer.encoder.finishRenderPass();

            backTexture = this.getBackTexture(filterData.previousRenderSurface, bounds);
        }

        const offset = Point.shared;

        // get previous bounds..
        if (this.filterStackIndex > 0)
        {
            offset.x = this.filterStack[this.filterStackIndex - 1].bounds.minX;
            offset.y = this.filterStack[this.filterStackIndex - 1].bounds.minY;
        }

        // update all the global uniforms used by each filter
        this.updateGlobalFilterUniforms(bounds, inputTexture, backTexture, offset);

        const filters = filterData.filterEffect.filters;

        this.filterGlobalUniforms.update();

        // get a BufferResource from the uniformBatch.
        // this will batch the shader uniform data and give us a buffer resource we can
        // set on our globalUniform Bind Group
        // eslint-disable-next-line max-len

        let globalUniforms: BindResource = this.filterGlobalUniforms;

        if ((renderer.renderPipes as GPURenderPipes).uniformBatch)
        {
            globalUniforms = (renderer.renderPipes as GPURenderPipes).uniformBatch
                .getUniformBufferResource(this.filterGlobalUniforms);
        }

        // update the resources on the bind group...
        this.globalFilterBindGroup.setResource(globalUniforms, 0);
        this.globalFilterBindGroup.setResource(inputTexture.style, 2);
        this.globalFilterBindGroup.setResource(backTexture.source, 3);

        if (filters.length === 1)
        {
            renderer.globalUniforms.pop();

            // render a single filter...
            // this.applyFilter(filters[0], inputTexture, filterData.previousRenderSurface, false);
            filters[0].apply(this, inputTexture, filterData.previousRenderSurface, false);

            // logDebugTexture(inputTexture, this.renderer);
            // return the texture to the pool so we can reuse the next frame
            TexturePool.returnTexture(inputTexture);
        }
        else
        {
            let flip = filterData.inputTexture;

            const outputFrame = this.filterGlobalUniforms.uniforms.outputFrame;

            // when rendering to another texture we need to reset the offset of the filter outPutFrame
            // basically we want it tucked into the top left corner..
            // we can then set the offset back again when its rendered to the final target
            const oX = outputFrame[0];
            const oY = outputFrame[1];

            outputFrame[0] = 0;
            outputFrame[1] = 0;
            this.filterGlobalUniforms.update();

            if ((renderer.renderPipes as GPURenderPipes).uniformBatch)
            {
                const globalUniforms2 = (renderer.renderPipes as GPURenderPipes).uniformBatch
                    .getUniformBufferResource(this.filterGlobalUniforms);

                this.globalFilterBindGroup.setResource(globalUniforms2, 0);
            }

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

            // remove the global uniforms we added

            renderer.globalUniforms.pop();

            if ((renderer.renderPipes as GPURenderPipes).uniformBatch)
            {
                this.globalFilterBindGroup.setResource(globalUniforms, 0);
            }
            else
            {
                outputFrame[0] = oX;
                outputFrame[1] = oY;
                this.filterGlobalUniforms.update();
            }

            // BUG - global frame is only correct for the last filter in the stack
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

    updateGlobalFilterUniforms(bounds: Bounds, texture: Texture, backTexture: Texture, offset: PointData)
    {
        const bx = bounds.minX;
        const by = bounds.minY;

        const uniforms = this.filterGlobalUniforms.uniforms;

        const outputFrame = uniforms.outputFrame;
        const inputSize = uniforms.inputSize;
        const inputPixel = uniforms.inputPixel;
        const inputClamp = uniforms.inputClamp;
        const backgroundFrame = uniforms.backgroundFrame;
        const globalFrame = uniforms.globalFrame;

        outputFrame[0] = bx - offset.x;
        outputFrame[1] = by - offset.y;
        outputFrame[2] = texture.frameWidth;
        outputFrame[3] = texture.frameHeight;

        inputSize[0] = texture.source.width;
        inputSize[1] = texture.source.height;
        inputSize[2] = 1 / inputSize[0];
        inputSize[3] = 1 / inputSize[1];

        inputPixel[0] = texture.source.pixelWidth;
        inputPixel[1] = texture.source.pixelHeight;
        inputPixel[2] = 1.0 / inputPixel[0];
        inputPixel[3] = 1.0 / inputPixel[1];

        inputClamp[0] = 0.5 * inputPixel[2];
        inputClamp[1] = 0.5 * inputPixel[3];
        inputClamp[2] = (texture.frameWidth * inputSize[2]) - (0.5 * inputPixel[2]);
        inputClamp[3] = (texture.frameHeight * inputSize[3]) - (0.5 * inputPixel[3]);

        backgroundFrame[0] = 0;
        backgroundFrame[1] = 0;
        backgroundFrame[2] = backTexture.layout.frame.width;
        backgroundFrame[3] = backTexture.layout.frame.height;

        let resolution = this.renderer.renderTarget.rootRenderTarget.colorTexture.source._resolution;

        if (this.filterStackIndex > 0)
        {
            resolution = this.filterStack[this.filterStackIndex - 1].inputTexture.source._resolution;
        }

        globalFrame[0] = offset.x * resolution;
        globalFrame[1] = offset.y * resolution;

        const rootTexture = this.renderer.renderTarget.rootRenderTarget.colorTexture;

        globalFrame[2] = rootTexture.source.width * resolution;
        globalFrame[3] = rootTexture.source.height * resolution;
    }

    getBackTexture(lastRenderSurface: RenderTarget, bounds: Bounds)
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

        if (this.filterStackIndex)
        {
            x -= this.filterStack[this.filterStackIndex - 1].bounds.minX;
            y -= this.filterStack[this.filterStackIndex - 1].bounds.minY;
        }

        x = Math.floor(x * backgroundResolution);
        y = Math.floor(y * backgroundResolution);

        const width = Math.ceil(bounds.width * backgroundResolution);
        const height = Math.ceil(bounds.height * backgroundResolution);

        this.renderer.renderTarget.copyToTexture(
            lastRenderSurface,
            backTexture,
            { x, y },
            { width, height }
        );

        return backTexture;
    }

    applyFilter(filter: Filter, input: Texture, output: RenderSurface, clear: boolean)
    {
        const renderer = this.renderer;

        renderer.renderTarget.bind(output, !!clear);

        // set bind group..
        this.globalFilterBindGroup.setResource(input.source, 1);

        filter.groups[0] = renderer.globalUniforms.bindGroup;
        filter.groups[1] = this.globalFilterBindGroup;

        renderer.encoder.draw({
            geometry: quadGeometry,
            shader: filter,
            state: filter._state,
            topology: 'triangle-list'
        });
    }

    getFilterData(): FilterData
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
     * @param {PIXI.Sprite} sprite - The sprite to map to.
     * @returns The mapped matrix.
     */
    calculateSpriteMatrix(outputMatrix: Matrix, sprite: Sprite): Matrix
    {
        const data = this.activeFilterData;

        const mappedMatrix = outputMatrix.set(
            data.inputTexture._source.width,
            0, 0,
            data.inputTexture._source.height,
            data.bounds.minX, data.bounds.minY
        );

        const worldTransform = sprite.worldTransform.copyTo(Matrix.shared);

        worldTransform.invert();
        mappedMatrix.prepend(worldTransform);
        mappedMatrix.scale(1.0 / (sprite.texture.frameWidth), 1.0 / (sprite.texture.frameHeight));

        mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

        return mappedMatrix;
    }

    destroy()
    {
        // BOOM!
    }
}

