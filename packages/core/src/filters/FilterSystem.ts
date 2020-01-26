import { System } from '../System';
import { RenderTexturePool } from '../renderTexture/RenderTexturePool';
import { Quad } from '../utils/Quad';
import { QuadUv } from '../utils/QuadUv';
import { Rectangle, Matrix } from '@pixi/math';
import { UniformGroup } from '../shader/UniformGroup';
import { DRAW_MODES, CLEAR_MODES, FILTER_TARGET_MODES } from '@pixi/constants';
import { deprecation } from '@pixi/utils';

import { FilterState } from './FilterState';
import { Filter } from './Filter';
import { FilterGeometry } from './FilterGeometry';
import { FilterPass } from './FilterPass';
import { IFilterTarget } from './IFilterTarget';
import { Renderer, RenderTexture, ISpriteMaskTarget } from '@pixi/core';

/**
 * System plugin to the renderer to manage the filters.
 *
 * @class
 * @memberof PIXI.systems
 * @extends PIXI.System
 */
export class FilterSystem extends System
{
    public readonly defaultFilterStack: Array<FilterState>;
    public statePool: Array<FilterState>;
    public texturePool: RenderTexturePool;
    public forceClear: boolean;
    protected quad: Quad;
    protected quadUv: QuadUv;
    protected activeState: FilterState;
    protected globalUniforms: UniformGroup;
    private tempRect: Rectangle;
    private geometry: FilterGeometry;

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        /**
         * List of filters for the FilterSystem
         * @member {Object[]}
         * @readonly
         */
        this.defaultFilterStack = [{}] as any;

        /**
         * stores a bunch of PO2 textures used for filtering
         * @member {Object}
         */
        this.texturePool = new RenderTexturePool();

        this.texturePool.setScreenSize(renderer.view);

        /**
         * a pool for storing filter states, save us creating new ones each tick
         * @member {Object[]}
         */
        this.statePool = [];

        /**
         * A very simple geometry used when drawing a filter effect to the screen
         * @member {PIXI.Quad}
         */
        this.quad = new Quad();

        /**
         * Quad UVs
         * @member {PIXI.QuadUv}
         */
        this.quadUv = new QuadUv();

        /**
         * Geometry that can convert frame-rectangles into native format.
         * @member {PIXI.FilterGeometry}
         */
        this.geometry = new FilterGeometry();

        /**
         * Temporary rect for maths
         * @type {PIXI.Rectangle}
         */
        this.tempRect = new Rectangle();

        /**
         * Active state
         * @member {object}
         */
        this.activeState = {} as any;

        /**
         * This uniform group is attached to filter uniforms when used
         * @member {PIXI.UniformGroup}
         * @property {PIXI.Rectangle} outputFrame
         * @property {Float32Array} inputSize
         * @property {Float32Array} inputPixel
         * @property {Float32Array} inputClamp
         * @property {Number} resolution
         * @property {Float32Array} filterArea
         * @property {Fload32Array} filterClamp
         */
        this.globalUniforms = new UniformGroup({
            outputFrame: this.tempRect,
            inputSize: new Float32Array(4),
            inputPixel: new Float32Array(4),
            inputClamp: new Float32Array(4),
            resolution: 1,

            // legacy variables
            filterArea: new Float32Array(4),
            filterClamp: new Float32Array(4),
        }, true);

        /**
         * Whether to clear output renderTexture in AUTO/BLIT mode. See {@link PIXI.CLEAR_MODES}
         * @member {boolean}
         */
        this.forceClear = false;
    }

    /**
     * Adds a new set of filters in the system.
     *
     * @param {PIXI.DisplayObject} target - The target of the filters to render.
     * @param {PIXI.Filter[]} filters - The filters to apply.
     */
    push(target: IFilterTarget, filters: Array<Filter>): void
    {
        const renderer = this.renderer;
        const filterStack = this.defaultFilterStack;
        const state = this.statePool.pop() || new FilterState();

        let resolution = filters[0].resolution;
        let padding = filters[0].padding;
        let autoFit = filters[0].autoFit;
        let legacy = filters[0].legacy;

        for (let i = 1; i < filters.length; i++)
        {
            const filter =  filters[i];

            resolution = Math.min(resolution, filter.resolution);
            padding = Math.max(padding, filter.padding);
            autoFit = autoFit || filter.autoFit;
            legacy = legacy || filter.legacy;
        }

        if (filterStack.length === 1)
        {
            this.defaultFilterStack[0].renderTexture = renderer.renderTexture.current;
        }

        filterStack.push(state);
        state.filters = filters;
        state.resolution = resolution;
        state.legacy = legacy;
        state.target = target;

        const filterBounds = target.filterArea || target.getBounds(true);
        const filterPasses = this.measureAll(filters, filterBounds, autoFit);

        state.filterPasses = filterPasses;
        state.renderTexture = this.resolveTexture(filterPasses, resolution);
        state.sourceFrame.copyFrom(state.renderTexture.filterFrame);
        state.destinationFrame.width = state.renderTexture.width;
        state.destinationFrame.height = state.renderTexture.height;

        renderer.renderTexture.bind(state.renderTexture, state.sourceFrame);
        renderer.renderTexture.clear();
    }

    /**
     * Removes the last set of filters and applies them.
     */
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

        inputPixel[0] = inputSize[0] * state.resolution;
        inputPixel[1] = inputSize[1] * state.resolution;
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

        if (filters.length === 1)
        {
            this.updateUniforms(state.currentFilterPass);
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
                this.updateUniforms(state.currentFilterPass);
                filters[i].apply(this, flip, flop, CLEAR_MODES.CLEAR, state);

                const t = flip;

                flip = flop;
                flop = t;

                ++state.passIndex;
            }

            filters[i].apply(this, flip, lastState.renderTexture, CLEAR_MODES.BLEND, state);

            this.returnFilterTexture(flip);
            this.returnFilterTexture(flop);
        }

        state.clear();
        this.statePool.push(state);
    }

    /**
     * Binds a renderTexture with corresponding `filterFrame`, clears it if mode corresponds.
     * @param {PIXI.RenderTexture} filterTexture renderTexture to bind, should belong to filter pool or filter stack
     * @param {PIXI.CLEAR_MODES} [clearMode] clearMode, by default its CLEAR/YES. See {@link PIXI.CLEAR_MODES}
     */
    bindAndClear(filterTexture: RenderTexture, clearMode = CLEAR_MODES.CLEAR): void
    {
        this.renderer.renderTexture.bind(filterTexture, filterTexture ? filterTexture.filterFrame : null);
        // TODO: remove in next major version
        if (typeof clearMode === 'boolean')
        {
            clearMode = clearMode ? CLEAR_MODES.CLEAR : CLEAR_MODES.BLEND;
            // get deprecation function from utils
            deprecation('5.2.1', 'Use CLEAR_MODES when using clear applyFilter option');
        }
        if (clearMode === CLEAR_MODES.CLEAR
            || (clearMode === CLEAR_MODES.BLIT && this.forceClear))
        {
            this.renderer.renderTexture.clear();
        }
    }

    /**
     * Draws a filter.
     *
     * @param {PIXI.Filter} filter - The filter to draw.
     * @param {PIXI.RenderTexture} input - The input render target.
     * @param {PIXI.RenderTexture} output - The target to output to.
     * @param {boolean} clear - Should the output be cleared before rendering to it
     */
    applyFilter(filter: Filter, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void
    {
        const renderer = this.renderer;

        this.bindAndClear(output, clearMode);

        // set the uniforms..
        filter.uniforms.uSampler = input;
        filter.uniforms.filterGlobals = this.globalUniforms;

        // TODO make it so that the order of this does not matter..
        // because it does at the moment cos of global uniforms.
        // they need to get resynced

        renderer.state.set(filter.state);
        renderer.shader.bind(filter);

        if (filter.legacy)
        {
            this.quadUv.map(input._frame, input.filterFrame);

            renderer.geometry.bind(this.quadUv);
            renderer.geometry.draw(DRAW_MODES.TRIANGLES);
        }
        else
        {
            this.geometry.useFrame(this.activeState.currentFilterPass.targetOutFrame,
                this.activeState);
            renderer.geometry.bind(this.geometry);
            renderer.geometry.draw(DRAW_MODES.TRIANGLE_STRIP);
        }
    }

    /**
     * Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.
     *
     * Use `outputMatrix * vTextureCoord` in the shader.
     *
     * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
     * @param {PIXI.Sprite} sprite - The sprite to map to.
     * @return {PIXI.Matrix} The mapped matrix.
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

    /**
     * Updates the filter system's global-uniforms to use the given filter-pass frames.
     *
     * @param {PIXI.FilterPass} filterPass
     */
    updateUniforms(filterPass: FilterPass): void
    {
        const globalUniforms = this.globalUniforms.uniforms;

        globalUniforms.inputFrame = filterPass.inputFrame;
        globalUniforms.targetInFrame = filterPass.targetInFrame;
        globalUniforms.outputFrame = filterPass.outputFrame;
        globalUniforms.targetOutFrame = filterPass.targetOutFrame;

        this.globalUniforms.update();
    }

    /**
     * Destroys this Filter System.
     */
    destroy(): void
    {
        // Those textures has to be destroyed by RenderTextureSystem or FramebufferSystem
        this.texturePool.clear(false);
    }

    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     *
     * @protected
     * @param {number} minWidth - The minimum width of the render texture in real pixels.
     * @param {number} minHeight - The minimum height of the render texture in real pixels.
     * @param {number} [resolution=1] - The resolution of the render texture.
     * @return {PIXI.RenderTexture} The new render texture.
     */
    protected getOptimalFilterTexture(minWidth: number, minHeight: number, resolution = 1): RenderTexture
    {
        return this.texturePool.getOptimalTexture(minWidth, minHeight, resolution);
    }

    /**
     * Gets extra render texture to use inside current filter
     * To be compliant with older filters, you can use params in any order
     *
     * @param {PIXI.RenderTexture} [input] renderTexture from which size and resolution will be copied
     * @param {number} [resolution] override resolution of the renderTexture
     * @returns {PIXI.RenderTexture}
     */
    getFilterTexture(input: RenderTexture, resolution: number): RenderTexture
    {
        if (typeof input === 'number')
        {
            const swap = input;

            input = resolution as any;
            resolution = swap;
        }

        input = input || this.activeState.renderTexture;

        const filterTexture = this.texturePool.getOptimalTexture(input.width, input.height, resolution || input.resolution);

        filterTexture.filterFrame = input.filterFrame;

        return filterTexture;
    }

    /**
     * Frees a render texture back into the pool.
     *
     * @param {PIXI.RenderTexture} renderTexture - The renderTarget to free
     */
    returnFilterTexture(renderTexture: RenderTexture): void
    {
        this.texturePool.returnTexture(renderTexture);
    }

    /**
     * Empties the texture pool.
     */
    emptyPool(): void
    {
        this.texturePool.clear(true);
    }

    /**
     * calls `texturePool.resize()`, affects fullScreen renderTextures
     */
    resize(): void
    {
        this.texturePool.setScreenSize(this.renderer.view);
    }

    private measureAll(filters: Filter[], targetBounds: Rectangle, autoFit = true): FilterPass[]
    {
        const filterPasses = this.measureForward(filters, targetBounds);
        const measuredOutputFrame = filterPasses[filters.length - 1].outputFrame;

        if (!autoFit)
        {
            return filterPasses;// no screen "fitting"
        }

        const outputFrame = measuredOutputFrame.clone().fit(this.renderer.renderTexture.sourceFrame);

        if (outputFrame.x === measuredOutputFrame.x
            && outputFrame.y === measuredOutputFrame.y
            && outputFrame.width === measuredOutputFrame.width
            && outputFrame.height === measuredOutputFrame.height)
        {
            return filterPasses;
        }

        return this.measureBackward(filters, filterPasses, outputFrame);
    }

    private measureBackward(filters: Filter[], filterPasses: FilterPass[], outputFrame: Rectangle): FilterPass[]
    {
        const targetInBuffer: Rectangle = new Rectangle();

        for (let passIndex = filters.length - 1; passIndex >= 0; passIndex--)
        {
            const filter = filters[passIndex];
            const filterPass = filterPasses[passIndex];

            targetInBuffer.copyFrom(filterPass.targetInFrame);

            filterPass.targetOutFrame.fit(outputFrame);
            filterPass.targetInFrame
                = filter.onMeasureInput(filterPass.targetOutFrame.clone(), filterPass.targetInFrame)
                    .fit(targetInBuffer);
            filterPass.inputFrame = outputFrame.clone().enlarge(filterPass.targetInFrame);

            outputFrame = filterPass.inputFrame;
        }

        return filterPasses;
    }

    private measureForward(filters: Filter[], targetBounds: Rectangle): FilterPass[]
    {
        const filterPasses: FilterPass[] = new Array(filters.length);
        let inputFrame: Rectangle = targetBounds;
        let targetInFrame: Rectangle;
        let outputFrame: Rectangle;
        let targetOutFrame: Rectangle;

        for (let passIndex = 0; passIndex < filters.length; passIndex++)
        {
            const filter = filters[passIndex];

            targetInFrame = this.resolveTargetFrame(filter, targetBounds, inputFrame);
            targetOutFrame = filter.onMeasureOutput(targetInFrame.clone());

            outputFrame = inputFrame.clone();
            outputFrame.enlarge(targetOutFrame);

            filterPasses[passIndex] = new FilterPass(inputFrame, targetInFrame, outputFrame, targetOutFrame);

            inputFrame = outputFrame;
        }

        return filterPasses;
    }

    private resolveTargetFrame(filter: Filter, targetBounds: Rectangle, inputFrame: Rectangle): Rectangle
    {
        switch (filter.targetMode)
        {
            case FILTER_TARGET_MODES.INPUT_FRAME:
                return inputFrame;
            case FILTER_TARGET_MODES.TARGET_BOUNDS:
                return targetBounds;
            default:
                throw new Error(`Illegal filter target-mode: ${filter.targetMode}`);
        }
    }

    private resolveTexture(filterPasses: FilterPass[], resolution = 1): RenderTexture
    {
        const frame = new Rectangle();

        for (let i = 0; i < filterPasses.length; i++)
        {
            const filterPass = filterPasses[i];

            frame.enlarge(filterPass.inputFrame);
            frame.enlarge(filterPass.outputFrame);
        }

        frame.ceil(resolution);

        const renderTexture = this.getOptimalFilterTexture(frame.width, frame.height, resolution);

        renderTexture.filterFrame = frame;

        return renderTexture;
    }
}
