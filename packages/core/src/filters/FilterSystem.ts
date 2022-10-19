import { RenderTexturePool } from '../renderTexture/RenderTexturePool';
import { Quad } from '../utils/Quad';
import { QuadUv } from '../utils/QuadUv';
import { Rectangle, Matrix, Point } from '@pixi/math';
import { UniformGroup } from '../shader/UniformGroup';
import { DRAW_MODES, CLEAR_MODES, MSAA_QUALITY } from '@pixi/constants';
import { FilterState } from './FilterState';

import type { ISystem } from '../system/ISystem';
import type { Filter } from './Filter';
import type { IFilterTarget } from './IFilterTarget';
import type { ISpriteMaskTarget } from './spriteMask/SpriteMaskFilter';
import type { RenderTexture } from '../renderTexture/RenderTexture';
import type { Renderer } from '../Renderer';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';

const tempPoints = [new Point(), new Point(), new Point(), new Point()];
const tempMatrix = new Matrix();

/**
 * System plugin to the renderer to manage filters.
 *
 * ## Pipeline
 *
 * The FilterSystem executes the filtering pipeline by rendering the display-object into a texture, applying its
 * [filters]{@link PIXI.Filter} in series, and the last filter outputs into the final render-target.
 *
 * The filter-frame is the rectangle in world space being filtered, and those contents are mapped into
 * `(0, 0, filterFrame.width, filterFrame.height)` into the filter render-texture. The filter-frame is also called
 * the source-frame, as it is used to bind the filter render-textures. The last filter outputs to the `filterFrame`
 * in the final render-target.
 *
 * ## Usage
 *
 * {@link PIXI.Container#renderAdvanced} is an example of how to use the filter system. It is a 3 step process:
 *
 * **push**: Use {@link PIXI.FilterSystem#push} to push the set of filters to be applied on a filter-target.
 * **render**: Render the contents to be filtered using the renderer. The filter-system will only capture the contents
 *      inside the bounds of the filter-target. NOTE: Using {@link PIXI.Renderer#render} is
 *      illegal during an existing render cycle, and it may reset the filter system.
 * **pop**: Use {@link PIXI.FilterSystem#pop} to pop & execute the filters you initially pushed. It will apply them
 *      serially and output to the bounds of the filter-target.
 * @memberof PIXI
 */
export class FilterSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: ExtensionType.RendererSystem,
        name: 'filter',
    };

    /**
     * List of filters for the FilterSystem
     * @member {object[]}
     */
    public readonly defaultFilterStack: Array<FilterState>;

    /** A pool for storing filter states, save us creating new ones each tick. */
    public statePool: Array<FilterState>;

    /** Stores a bunch of POT textures used for filtering. */
    public texturePool: RenderTexturePool;

    /** Whether to clear output renderTexture in AUTO/BLIT mode. See {@link PIXI.CLEAR_MODES}. */
    public forceClear: boolean;

    /**
     * Old padding behavior is to use the max amount instead of sum padding.
     * Use this flag if you need the old behavior.
     * @default false
     */
    public useMaxPadding: boolean;

    /** A very simple geometry used when drawing a filter effect to the screen. */
    protected quad: Quad;

    /** Quad UVs */
    protected quadUv: QuadUv;

    /**
     * Active state
     * @member {object}
     */
    protected activeState: FilterState;

    /**
     * This uniform group is attached to filter uniforms when used.
     * @property {PIXI.Rectangle} outputFrame -
     * @property {Float32Array} inputSize -
     * @property {Float32Array} inputPixel -
     * @property {Float32Array} inputClamp -
     * @property {number} resolution -
     * @property {Float32Array} filterArea -
     * @property {Float32Array} filterClamp -
     */
    protected globalUniforms: UniformGroup;

    /** Temporary rect for math. */
    private tempRect: Rectangle;
    public renderer: Renderer;

    /**
     * @param renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        this.defaultFilterStack = [{}] as any;

        this.texturePool = new RenderTexturePool();

        this.statePool = [];

        this.quad = new Quad();
        this.quadUv = new QuadUv();
        this.tempRect = new Rectangle();
        this.activeState = {} as any;

        this.globalUniforms = new UniformGroup({
            outputFrame: new Rectangle(),
            inputSize: new Float32Array(4),
            inputPixel: new Float32Array(4),
            inputClamp: new Float32Array(4),
            resolution: 1,

            // legacy variables
            filterArea: new Float32Array(4),
            filterClamp: new Float32Array(4),
        }, true);

        this.forceClear = false;
        this.useMaxPadding = false;
    }

    init(): void
    {
        this.texturePool.setScreenSize(this.renderer.view);
    }

    /**
     * Pushes a set of filters to be applied later to the system. This will redirect further rendering into an
     * input render-texture for the rest of the filtering pipeline.
     * @param {PIXI.DisplayObject} target - The target of the filter to render.
     * @param filters - The filters to apply.
     */
    push(target: IFilterTarget, filters: Array<Filter>): void
    {
        const renderer = this.renderer;
        const filterStack = this.defaultFilterStack;
        const state = this.statePool.pop() || new FilterState();
        const renderTextureSystem = this.renderer.renderTexture;

        let resolution = filters[0].resolution;
        let multisample = filters[0].multisample;
        let padding = filters[0].padding;
        let autoFit = filters[0].autoFit;
        // We don't know whether it's a legacy filter until it was bound for the first time,
        // therefore we have to assume that it is if legacy is undefined.
        let legacy = filters[0].legacy ?? true;

        for (let i = 1; i < filters.length; i++)
        {
            const filter = filters[i];

            // let's use the lowest resolution
            resolution = Math.min(resolution, filter.resolution);
            // let's use the lowest number of samples
            multisample = Math.min(multisample, filter.multisample);
            // figure out the padding required for filters
            padding = this.useMaxPadding
                // old behavior: use largest amount of padding!
                ? Math.max(padding, filter.padding)
                // new behavior: sum the padding
                : padding + filter.padding;
            // only auto fit if all filters are autofit
            autoFit = autoFit && filter.autoFit;

            legacy = legacy || (filter.legacy ?? true);
        }

        if (filterStack.length === 1)
        {
            this.defaultFilterStack[0].renderTexture = renderTextureSystem.current;
        }

        filterStack.push(state);

        state.resolution = resolution;
        state.multisample = multisample;

        state.legacy = legacy;

        state.target = target;
        state.sourceFrame.copyFrom(target.filterArea || target.getBounds(true));

        state.sourceFrame.pad(padding);

        const sourceFrameProjected = this.tempRect.copyFrom(renderTextureSystem.sourceFrame);

        // Project source frame into world space (if projection is applied)
        if (renderer.projection.transform)
        {
            this.transformAABB(
                tempMatrix.copyFrom(renderer.projection.transform).invert(),
                sourceFrameProjected
            );
        }

        if (autoFit)
        {
            state.sourceFrame.fit(sourceFrameProjected);

            if (state.sourceFrame.width <= 0 || state.sourceFrame.height <= 0)
            {
                state.sourceFrame.width = 0;
                state.sourceFrame.height = 0;
            }
        }
        else if (!state.sourceFrame.intersects(sourceFrameProjected))
        {
            state.sourceFrame.width = 0;
            state.sourceFrame.height = 0;
        }

        // Round sourceFrame in screen space based on render-texture.
        this.roundFrame(
            state.sourceFrame,
            renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution,
            renderTextureSystem.sourceFrame,
            renderTextureSystem.destinationFrame,
            renderer.projection.transform,
        );

        state.renderTexture = this.getOptimalFilterTexture(state.sourceFrame.width, state.sourceFrame.height,
            resolution, multisample);
        state.filters = filters;

        state.destinationFrame.width = state.renderTexture.width;
        state.destinationFrame.height = state.renderTexture.height;

        const destinationFrame = this.tempRect;

        destinationFrame.x = 0;
        destinationFrame.y = 0;
        destinationFrame.width = state.sourceFrame.width;
        destinationFrame.height = state.sourceFrame.height;

        state.renderTexture.filterFrame = state.sourceFrame;
        state.bindingSourceFrame.copyFrom(renderTextureSystem.sourceFrame);
        state.bindingDestinationFrame.copyFrom(renderTextureSystem.destinationFrame);

        state.transform = renderer.projection.transform;
        renderer.projection.transform = null;
        renderTextureSystem.bind(state.renderTexture, state.sourceFrame, destinationFrame);
        renderer.framebuffer.clear(0, 0, 0, 0);
    }

    /** Pops off the filter and applies it. */
    pop(): void
    {
        const filterStack = this.defaultFilterStack;
        const state = filterStack.pop();
        const filters = state.filters;

        this.activeState = state;

        const globalUniforms = this.globalUniforms.uniforms;

        globalUniforms.outputFrame = state.sourceFrame;
        globalUniforms.resolution = state.resolution;

        const inputSize = globalUniforms.inputSize;
        const inputPixel = globalUniforms.inputPixel;
        const inputClamp = globalUniforms.inputClamp;

        inputSize[0] = state.destinationFrame.width;
        inputSize[1] = state.destinationFrame.height;
        inputSize[2] = 1.0 / inputSize[0];
        inputSize[3] = 1.0 / inputSize[1];

        inputPixel[0] = Math.round(inputSize[0] * state.resolution);
        inputPixel[1] = Math.round(inputSize[1] * state.resolution);
        inputPixel[2] = 1.0 / inputPixel[0];
        inputPixel[3] = 1.0 / inputPixel[1];

        inputClamp[0] = 0.5 * inputPixel[2];
        inputClamp[1] = 0.5 * inputPixel[3];
        inputClamp[2] = (state.sourceFrame.width * inputSize[2]) - (0.5 * inputPixel[2]);
        inputClamp[3] = (state.sourceFrame.height * inputSize[3]) - (0.5 * inputPixel[3]);

        // only update the rect if its legacy..
        if (state.legacy)
        {
            const filterArea = globalUniforms.filterArea;

            filterArea[0] = state.destinationFrame.width;
            filterArea[1] = state.destinationFrame.height;
            filterArea[2] = state.sourceFrame.x;
            filterArea[3] = state.sourceFrame.y;

            globalUniforms.filterClamp = globalUniforms.inputClamp;
        }

        this.globalUniforms.update();

        const lastState = filterStack[filterStack.length - 1];

        this.renderer.framebuffer.blit();

        if (filters.length === 1)
        {
            filters[0].apply(this, state.renderTexture, lastState.renderTexture, CLEAR_MODES.BLEND, state);

            this.returnFilterTexture(state.renderTexture);
        }
        else
        {
            let flip = state.renderTexture;
            let flop = this.getOptimalFilterTexture(
                flip.width,
                flip.height,
                state.resolution
            );

            flop.filterFrame = flip.filterFrame;

            let i = 0;

            for (i = 0; i < filters.length - 1; ++i)
            {
                if (i === 1 && state.multisample > 1)
                {
                    flop = this.getOptimalFilterTexture(
                        flip.width,
                        flip.height,
                        state.resolution
                    );

                    flop.filterFrame = flip.filterFrame;
                }

                filters[i].apply(this, flip, flop, CLEAR_MODES.CLEAR, state);

                const t = flip;

                flip = flop;
                flop = t;
            }

            filters[i].apply(this, flip, lastState.renderTexture, CLEAR_MODES.BLEND, state);

            if (i > 1 && state.multisample > 1)
            {
                this.returnFilterTexture(state.renderTexture);
            }

            this.returnFilterTexture(flip);
            this.returnFilterTexture(flop);
        }

        // lastState.renderTexture is blitted when lastState is popped

        state.clear();
        this.statePool.push(state);
    }

    /**
     * Binds a renderTexture with corresponding `filterFrame`, clears it if mode corresponds.
     * @param filterTexture - renderTexture to bind, should belong to filter pool or filter stack
     * @param clearMode - clearMode, by default its CLEAR/YES. See {@link PIXI.CLEAR_MODES}
     */
    bindAndClear(filterTexture: RenderTexture, clearMode: CLEAR_MODES = CLEAR_MODES.CLEAR): void
    {
        const {
            renderTexture: renderTextureSystem,
            state: stateSystem,
        } = this.renderer;

        if (filterTexture === this.defaultFilterStack[this.defaultFilterStack.length - 1].renderTexture)
        {
            // Restore projection transform if rendering into the output render-target.
            this.renderer.projection.transform = this.activeState.transform;
        }
        else
        {
            // Prevent projection within filtering pipeline.
            this.renderer.projection.transform = null;
        }

        if (filterTexture?.filterFrame)
        {
            const destinationFrame = this.tempRect;

            destinationFrame.x = 0;
            destinationFrame.y = 0;
            destinationFrame.width = filterTexture.filterFrame.width;
            destinationFrame.height = filterTexture.filterFrame.height;

            renderTextureSystem.bind(filterTexture, filterTexture.filterFrame, destinationFrame);
        }
        else if (filterTexture !== this.defaultFilterStack[this.defaultFilterStack.length - 1].renderTexture)
        {
            renderTextureSystem.bind(filterTexture);
        }
        else
        {
            // Restore binding for output render-target.
            this.renderer.renderTexture.bind(
                filterTexture,
                this.activeState.bindingSourceFrame,
                this.activeState.bindingDestinationFrame
            );
        }

        // Clear the texture in BLIT mode if blending is disabled or the forceClear flag is set. The blending
        // is stored in the 0th bit of the state.
        const autoClear = (stateSystem.stateId & 1) || this.forceClear;

        if (clearMode === CLEAR_MODES.CLEAR
            || (clearMode === CLEAR_MODES.BLIT && autoClear))
        {
            // Use framebuffer.clear because we want to clear the whole filter texture, not just the filtering
            // area over which the shaders are run. This is because filters may sampling outside of it (e.g. blur)
            // instead of clamping their arithmetic.
            this.renderer.framebuffer.clear(0, 0, 0, 0);
        }
    }

    /**
     * Draws a filter using the default rendering process.
     *
     * This should be called only by {@link Filter#apply}.
     * @param filter - The filter to draw.
     * @param input - The input render target.
     * @param output - The target to output to.
     * @param clearMode - Should the output be cleared before rendering to it
     */
    applyFilter(filter: Filter, input: RenderTexture, output: RenderTexture, clearMode?: CLEAR_MODES): void
    {
        const renderer = this.renderer;

        // Set state before binding, so bindAndClear gets the blend mode.
        renderer.state.set(filter.state);
        this.bindAndClear(output, clearMode);

        // set the uniforms..
        filter.uniforms.uSampler = input;
        filter.uniforms.filterGlobals = this.globalUniforms;

        // TODO make it so that the order of this does not matter..
        // because it does at the moment cos of global uniforms.
        // they need to get resynced
        renderer.shader.bind(filter);

        // check to see if the filter is a legacy one..
        filter.legacy = !!filter.program.attributeData.aTextureCoord;

        if (filter.legacy)
        {
            this.quadUv.map(input._frame, input.filterFrame);

            renderer.geometry.bind(this.quadUv);
            renderer.geometry.draw(DRAW_MODES.TRIANGLES);
        }
        else
        {
            renderer.geometry.bind(this.quad);
            renderer.geometry.draw(DRAW_MODES.TRIANGLE_STRIP);
        }
    }

    /**
     * Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.
     *
     * Use `outputMatrix * vTextureCoord` in the shader.
     * @param outputMatrix - The matrix to output to.
     * @param {PIXI.Sprite} sprite - The sprite to map to.
     * @returns The mapped matrix.
     */
    calculateSpriteMatrix(outputMatrix: Matrix, sprite: ISpriteMaskTarget): Matrix
    {
        const { sourceFrame, destinationFrame } = this.activeState;
        const { orig } = sprite._texture;
        const mappedMatrix = outputMatrix.set(destinationFrame.width, 0, 0,
            destinationFrame.height, sourceFrame.x, sourceFrame.y);
        const worldTransform = sprite.worldTransform.copyTo(Matrix.TEMP_MATRIX);

        worldTransform.invert();
        mappedMatrix.prepend(worldTransform);
        mappedMatrix.scale(1.0 / orig.width, 1.0 / orig.height);
        mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

        return mappedMatrix;
    }

    /** Destroys this Filter System. */
    destroy(): void
    {
        this.renderer = null;

        // Those textures has to be destroyed by RenderTextureSystem or FramebufferSystem
        this.texturePool.clear(false);
    }

    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     * @param minWidth - The minimum width of the render texture in real pixels.
     * @param minHeight - The minimum height of the render texture in real pixels.
     * @param resolution - The resolution of the render texture.
     * @param multisample - Number of samples of the render texture.
     * @returns - The new render texture.
     */
    protected getOptimalFilterTexture(minWidth: number, minHeight: number, resolution = 1,
        multisample: MSAA_QUALITY = MSAA_QUALITY.NONE): RenderTexture
    {
        return this.texturePool.getOptimalTexture(minWidth, minHeight, resolution, multisample);
    }

    /**
     * Gets extra render texture to use inside current filter
     * To be compliant with older filters, you can use params in any order
     * @param input - renderTexture from which size and resolution will be copied
     * @param resolution - override resolution of the renderTexture
     * @param multisample - number of samples of the renderTexture
     */
    getFilterTexture(input?: RenderTexture, resolution?: number, multisample?: MSAA_QUALITY): RenderTexture
    {
        if (typeof input === 'number')
        {
            const swap = input;

            input = resolution as any;
            resolution = swap;
        }

        input = input || this.activeState.renderTexture;

        const filterTexture = this.texturePool.getOptimalTexture(input.width, input.height, resolution || input.resolution,
            multisample || MSAA_QUALITY.NONE);

        filterTexture.filterFrame = input.filterFrame;

        return filterTexture;
    }

    /**
     * Frees a render texture back into the pool.
     * @param renderTexture - The renderTarget to free
     */
    returnFilterTexture(renderTexture: RenderTexture): void
    {
        this.texturePool.returnTexture(renderTexture);
    }

    /** Empties the texture pool. */
    emptyPool(): void
    {
        this.texturePool.clear(true);
    }

    /** Calls `texturePool.resize()`, affects fullScreen renderTextures. */
    resize(): void
    {
        this.texturePool.setScreenSize(this.renderer.view);
    }

    /**
     * @param matrix - first param
     * @param rect - second param
     */
    private transformAABB(matrix: Matrix, rect: Rectangle): void
    {
        const lt = tempPoints[0];
        const lb = tempPoints[1];
        const rt = tempPoints[2];
        const rb = tempPoints[3];

        lt.set(rect.left, rect.top);
        lb.set(rect.left, rect.bottom);
        rt.set(rect.right, rect.top);
        rb.set(rect.right, rect.bottom);

        matrix.apply(lt, lt);
        matrix.apply(lb, lb);
        matrix.apply(rt, rt);
        matrix.apply(rb, rb);

        const x0 = Math.min(lt.x, lb.x, rt.x, rb.x);
        const y0 = Math.min(lt.y, lb.y, rt.y, rb.y);
        const x1 = Math.max(lt.x, lb.x, rt.x, rb.x);
        const y1 = Math.max(lt.y, lb.y, rt.y, rb.y);

        rect.x = x0;
        rect.y = y0;
        rect.width = x1 - x0;
        rect.height = y1 - y0;
    }

    private roundFrame(
        frame: Rectangle,
        resolution: number,
        bindingSourceFrame: Rectangle,
        bindingDestinationFrame: Rectangle,
        transform?: Matrix
    )
    {
        if (frame.width <= 0 || frame.height <= 0 || bindingSourceFrame.width <= 0 || bindingSourceFrame.height <= 0)
        {
            return;
        }

        if (transform)
        {
            const { a, b, c, d } = transform;

            // Skip if skew/rotation present in matrix, except for multiple of 90° rotation. If rotation
            // is a multiple of 90°, then either pair of (b,c) or (a,d) will be (0,0).
            if ((Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4)
                && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4))
            {
                return;
            }
        }

        transform = transform ? tempMatrix.copyFrom(transform) : tempMatrix.identity();

        // Get forward transform from world space to screen space
        transform
            .translate(-bindingSourceFrame.x, -bindingSourceFrame.y)
            .scale(
                bindingDestinationFrame.width / bindingSourceFrame.width,
                bindingDestinationFrame.height / bindingSourceFrame.height)
            .translate(bindingDestinationFrame.x, bindingDestinationFrame.y);

        // Convert frame to screen space
        this.transformAABB(transform, frame);

        // Round frame in screen space
        frame.ceil(resolution);

        // Project back into world space.
        this.transformAABB(transform.invert(), frame);
    }
}

extensions.add(FilterSystem);
