import { System } from '../System';
import { RenderTexturePool } from '../renderTexture/RenderTexturePool';
import { Quad } from '../utils/Quad';
import { QuadUv } from '../utils/QuadUv';
import { Rectangle, Matrix, Point } from '@pixi/math';
import { UniformGroup } from '../shader/UniformGroup';
import { Geometry } from '../geometry/Geometry';
import { DRAW_MODES } from '@pixi/constants';

const GEOMETRY_INDICES = [0, 1, 3, 2];

/**
 * Manages all the filters applied on an object in the display-object hierarchy. It
 * is stateful and is used to communicate information to filter objects.
 *
 * @class
 * @private
 */
class FilterPipe
{
    constructor()
    {
        /**
         * The render-texture that was used to draw the object without filters.
         * @member {PIXI.RenderTexture}
         */
        this.renderTexture = null;

        /**
         * Whether returning a texture different than the given output is allowed
         * for the current filter pass.
         * @member {boolean}
         */
        this.outputSwappable = false;

        /**
         * Target of the filters
         * We store for case when custom filter wants to know the element it was applied on
         * @member {PIXI.DisplayObject}
         */
        this.target = null;

        /**
         * Compatibility with PixiJS v4 filters
         * @member {boolean}
         * @default false
         */
        this.legacy = false;

        /**
         * Resolution of filters
         * @member {number}
         * @default 1
         */
        this.resolution = 1;

        /**
         * Whether all filters can be rendered in reasonable time.
         * @member {boolean}
         */
        this.renderable = true;

        /**
         * Frame of the target object's total filter area (including padding).
         * @member {PIXI.Rectangle}
         * @private
         */
        this.targetFrame = null;

        /**
         * Frame in which pixels are to be calculated for rendering onto the
         * final renderTexture/screen.
         * @member {PIXI.Rectangle}
         * @private
         */
        this.outputFrame = new Rectangle();

        /**
         * Dimensions of the renderer texture on which the output pixels are stored.
         * @member {PIXI.Point}
         * @private
         */
        this.textureDimensions = new Point();

        /**
         * Collection of filters
         * @member {PIXI.Filter[]}
         * @private
         */
        this.filters = [];
    }

    /**
     * Legacy alias of `FilterPipe#outputFrame`.
     * @returns {PIXI.Rectangle}
     */
    get sourceFrame()
    {
        return this.outputFrame;
    }

    /**
     * Legacy alias of `FilterPipe#textureDimensions`, in `PIXI.Rectangle` form.
     * @returns {PIXI.Rectangle}
     */
    get destinationFrame()
    {
        return new Rectangle(0, 0, this.textureDimensions.x, this.textureDimensions.y);
    }

    /**
     * Bounds of the target, without the filter padding.
     * @returns {PIXI.Rectangle}
     */
    get nakedTargetBounds()
    {
        if (this._nakedTargetBounds)
        {
            return this._nakedTargetBounds;
        }

        this._nakedTargetBounds = this.targetFrame.clone().pad(-this.padding);

        return this._nakedTargetBounds;
    }

    /**
     * Clears the pipe's state
     * @protected
     */
    clear()
    {
        this.target = null;
        this.filters = null;
        this.renderTexture = null;
        this._nakedTargetBounds = null;
    }
}

/**
 * System plugin to the renderer to manage the filters.
 *
 * @class
 * @memberof PIXI.systems
 * @extends PIXI.System
 */
export class FilterSystem extends System
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * List of filters for the FilterSystem
         * @member {Object[]}
         * @readonly
         */
        this.defaultFilterStack = [{}];

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
         * Temporary rect for maths
         * @type {PIXI.Rectangle}
         */
        this.tempRect = new Rectangle();

        /**
         * Active filter pipe.
         * @member {object}
         */
        this.activeState = {};

        /**
         * This uniform group is attached to filter uniforms when used
         * @member {PIXI.UniformGroup}
         * @property {PIXI.Rectangle} outputFrame
         * @property {Float32Array} inputSize
         * @property {Float32Array} inputPixel
         * @property {Float32Array} inputClamp
         * @property {Number} resolution
         * @property {Float32Array} filterArea
         * @property {Float32Array} filterClamp
         * @property {Float32Array} inputFrameInverse
         * @property {Float32Array} outputFrameInverse
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

            // inverses of input/output frame dimensions
            inputFrameInverse: new Float32Array(2),
            outputFrameInverse: new Float32Array(2),
        }, true);

        this._pixelsWidth = renderer.view.width;
        this._pixelsHeight = renderer.view.height;
    }

    /**
     * Adds the filters given to this sytem's filter stack.
     * @param {PIXI.DisplayObject} target - The target of the filter to render.
     * @param {PIXI.Filter[]} filters - The filters to apply.
     */
    push(target, filters)
    {
        const renderer = this.renderer;
        const filterStack = this.defaultFilterStack;
        const state = this._newPipe(target, filters);

        if (filterStack.length === 1)
        {
            this.defaultFilterStack[0].renderTexture = renderer.renderTexture.current;
        }

        filterStack.push(state);

        this.measure(state);

        if (state.filters.length > 0)
        {
            state.renderTexture = this.filterPassRenderTextureFor(state);
            state.textureDimensions.set(state.renderTexture.width, state.renderTexture.height);

            state.renderTexture.filterFrame = state.inputFrame;
            renderer.renderTexture.bind(state.renderTexture, state.inputFrame);
            renderer.renderTexture.clear();
        }
    }

    /**
     * Pops off the last target's filters and applies them.
     */
    pop()
    {
        const filterStack = this.defaultFilterStack;
        const state = filterStack.pop();
        const filters = state.filters;

        this.activeState = state;

        if (filters.length > 0)
        {
            const globalUniforms = this.globalUniforms.uniforms;
            const { inputSize, inputPixel, inputClamp } = globalUniforms;

            globalUniforms.resolution = state.resolution;

            inputSize[0] = state.textureDimensions.x;
            inputSize[1] = state.textureDimensions.y;
            inputSize[2] = 1.0 / inputSize[0];
            inputSize[3] = 1.0 / inputSize[1];

            inputPixel[0] = inputSize[0] * state.resolution;
            inputPixel[1] = inputSize[1] * state.resolution;
            inputPixel[2] = 1.0 / inputPixel[0];
            inputPixel[3] = 1.0 / inputPixel[1];

            inputClamp[0] = 0.5 * inputPixel[2];
            inputClamp[1] = 0.5 * inputPixel[3];

            const lastState = filterStack[filterStack.length - 1];

            if (filters.length === 1)
            {
                this.passUniforms(state, 0);
                filters[0].apply(this, state.renderTexture, lastState.renderTexture, false, state);

                this.returnFilterTexture(state.renderTexture);
            }
            else
            {
                let flip = state.renderTexture;

                let flop = this.getOptimalFilterTexture(
                    flip.width,
                    flip.height,
                    state.resolution,
                );

                let i = 0;

                state.outputSwappable = true;

                for (i = 0; i < filters.length - 1; ++i)
                {
                    this.passUniforms(state, i);
                    flop.filterFrame = state.filters[i + 1].frame ? state.filters[i + 1].frame : state.outputFrame;

                    const output = filters[i].apply(this, flip, flop, true, state);

                    if (output && output !== flop) // output is different from the given one
                    {
                        if (output !== flip) // output is different than the provided input
                        {
                            this.returnFilterTexture(flop);
                            flop = output;
                        }
                        else
                        {
                            continue;// no need to flip-flop since input already was made the output
                        }
                    }

                    const t = flip;

                    flip = flop;
                    flop = t;
                }

                this.passUniforms(state, filters.length - 1);
                state.outputSwappable = false;
                filters[i].apply(this, flip, lastState.renderTexture, false, state);

                this.returnFilterTexture(flip);
                this.returnFilterTexture(flop);
            }
        }

        state.clear();
        this.statePool.push(state);
    }

    /**
     * Measures all the frames needed in the given pipe. This includes
     * the target, input, output, and each filter's frame.
     *
     * NOTE: `measure` also calculates `resolution`, `padding`,
     *  and `legacy` of the pipe.
     *
     * @param {FilterPipe} state
     */
    measure(state)
    {
        const { target } = state;
        let { filters } = state;

        let resolution = filters[0].resolution;

        let padding = filters[0].padding;

        let autoFit = filters[0].autoFit;

        let legacy = filters[0].legacy;

        for (let i = 1; i < filters.length; i++)
        {
            const filter =  filters[i];

            resolution = Math.min(resolution, filter.resolution);
            padding = Math.max(padding, filter.padding);
            autoFit = autoFit && filter.autoFit;
            legacy = legacy || filter.legacy;
        }

        // target- & output- frame measuring pass
        state.resolution = resolution;
        state.legacy = legacy;
        state.target = target;
        state.padding = padding;
        state.outputFrame.copyFrom(target.filterArea || target.getBounds(true));
        state.outputFrame.pad(padding);

        if (autoFit)
        {
            state.targetFrame = state.outputFrame.clone();
            state.targetFrame.ceil(resolution);
            state.outputFrame.fit(this.renderer.renderTexture.sourceFrame);
        }
        else
        {
            state.targetFrame = state.outputFrame;
        }

        state.outputFrame.ceil(resolution);

        const { targetFrame, outputFrame } = state;

        // per-filter frame measuring pass
        let filterPassFrame = outputFrame;

        let renderable = true;

        // can we modify filters? (only after it is cloned)
        let filtersMutable = false;

        for (let i = filters.length - 1; i >= 0; i--)
        {
            const filter = filters[i];

            filter.measure(targetFrame, filterPassFrame.clone(), padding);
            const pfilterPassFrame = filters[i].frame.fit(targetFrame);

            if (pfilterPassFrame.width <= 0 || pfilterPassFrame.height <= 0)
            {
                if (!filtersMutable)
                {
                    filters = state.filters.slice();
                    state.filters = filters;
                    filtersMutable = true;
                }

                filters.splice(i, 1);
            }
            else
            {
                renderable = renderable && filter.renderable;
                filterPassFrame = pfilterPassFrame;
            }
        }

        state.renderable = renderable;

        // filters may become empty if filters return empty rectangles as inputs.
        state.inputFrame = filters[0] && filters[0].frame ? filters[0].frame : outputFrame;
    }

    /**
     * Premeasure the frames needed by the filter system during a render pass. This is
     * useful if you need measurements in a custom `render` method.
     *
     * TODO: Support caching measurements until flushing the filter pipe
     *
     * @param {PIXI.DisplayObject} target
     * @param {Array<PIXI.Filter>} filters
     * @returns {FilterPipe} pipe with measurements
     */
    premeasure(target, filters)
    {
        const pipe = this._newPipe(target, filters);

        this.measure(pipe);

        return pipe;
    }

    get inputFrame()
    {
        return this.globalUniforms.uniforms.inputFrame;
    }

    get outputFrame()
    {
        return this.globalUniforms.uniforms.outputFrame;
    }

    /**
     * Runs a filter on `input` into `output`.
     *
     * @param {PIXI.Filter} filter - the filter to draw
     * @param {PIXI.RenderTexture} input
     * @param {PIXI.RenderTexture} output
     * @param {boolean} clear - should the output be cleared before rendering to it
     * @param {object}[options] - additional options
     * @param {object}[options.geometry=this.convertFrameToGeometry(this.activeState.outputFrame)] - the geometry
     *      to draw on the output. This is generally the output frame's geometry.
     * @param {object}[options.drawMode=PIXI.DRAW_MODES.TRIANGLE_STRIP] - the draw mode to use, if given a custom
     *      geometry.
     */
    applyFilter(filter, input, output, clear, options = {})
    {
        const renderer = this.renderer;

        renderer.renderTexture.bind(output, output ? output.filterFrame : null);

        if (clear)
        {
            // gl.disable(gl.SCISSOR_TEST);
            renderer.renderTexture.clear();
            // gl.enable(gl.SCISSOR_TEST);
        }

        // set the uniforms..
        filter.uniforms.uSampler = input;
        filter.uniforms.filterGlobals = this.globalUniforms;

        // TODO make it so that the order of this does not matter..
        // because it does at the moment cos of global uniforms.
        // they need to get resynced

        renderer.state.set(filter.state);
        renderer.shader.bind(filter);

        if (options.geometry)
        {
            renderer.geometry.bind(options.geometry);
            renderer.geometry.draw(options.drawMode ? options.drawMode : DRAW_MODES.TRIANGLE_STRIP);
        }
        else if (filter.legacy)
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
     *
     * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
     * @param {PIXI.Sprite} sprite - The sprite to map to.
     * @return {PIXI.Matrix} The mapped matrix.
     */
    calculateSpriteMatrix(outputMatrix, sprite)
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

    /** @private */
    filterPassRenderTextureFor(state)
    {
        let width = 0;

        let height = 0;

        let defaultIncluded = false;

        for (let i = 0; i < state.filters.length; i++)
        {
            const filter = state.filters[i];

            if (filter.frame)
            {
                width = Math.max(width, filter.frame.width);
                height = Math.max(height, filter.frame.height);
            }
            else if (!defaultIncluded)
            {
                width = Math.max(width, state.outputFrame.width);
                height = Math.max(height, state.outputFrame.height);
                defaultIncluded = true;
            }
        }

        return this.getOptimalFilterTexture(width, height, state.resolution);
    }

    /** @private */
    passUniforms(state, filterIndex)
    {
        this._lastFilterIndex = filterIndex;

        const filter = state.filters[filterIndex];
        const nextFilter = (filterIndex === state.filters.length - 1) ? null : state.filters[filterIndex + 1];
        const globalUniforms = this.globalUniforms.uniforms;
        const { inputSize, inputPixel, inputClamp, inputFrameInverse, outputFrameInverse } = globalUniforms;
        const inputFrame = filter.frame ? filter.frame : state.outputFrame;
        const outputFrame = (nextFilter && nextFilter.frame) ? nextFilter.frame : state.outputFrame;

        inputClamp[2] = (inputFrame.width * inputSize[2]) - (0.5 * inputPixel[2]);
        inputClamp[3] = (inputFrame.height * inputSize[3]) - (0.5 * inputPixel[3]);

        globalUniforms.inputFrame = inputFrame;
        globalUniforms.outputFrame = outputFrame;

        inputFrameInverse[0] = 1 / inputFrame.width;
        inputFrameInverse[1] = 1 / inputFrame.height;

        outputFrameInverse[0] = 1 / outputFrame.width;
        outputFrameInverse[1] = 1 / outputFrame.height;

        if (state.legacy)
        {
            const filterArea = globalUniforms.filterArea;

            filterArea[0] = state.textureDimensions.x;
            filterArea[1] = state.textureDimensions.y;
            filterArea[2] = outputFrame.x;
            filterArea[3] = outputFrame.y;

            globalUniforms.filterClamp = globalUniforms.inputClamp;
        }

        this.globalUniforms.update();
    }

    /**
     * Converts the given frame into a geometry that the default vertex shader will
     * draw. `frame` should fit inside `outputFrame`.
     * @param {Rectangle} frame - the frame to draw
     * @param {Rectangle}[outputFrame] - the output frame in which the filter operates. This
     *      is what the texture being drawn to represents.
     * @returns {Geometry} - the geometry to be used
     */
    convertFrameToGeometry(frame, outputFrame = this.outputFrame)
    {
        const u0 = (frame.x - outputFrame.x) / outputFrame.width;
        const u1 = u0 + (frame.width / outputFrame.width);
        const v0 = (frame.y - outputFrame.y) / outputFrame.height;
        const v1 = v0 + (frame.height / outputFrame.height);
        const geometry = this._newGeometry();

        geometry.addAttribute('aVertexPosition', [
            u0, v0,
            u1, v0,
            u1, v1,
            u0, v1,
        ]);

        geometry.addIndex(GEOMETRY_INDICES);

        return geometry;
    }

    _newPipe(target, filters)
    {
        const pipe = this.statePool.pop() || new FilterPipe();

        if (target)
        {
            pipe.target = target;
            pipe.filters = filters ? filters : target.filters;
        }

        return pipe;
    }

    _newGeometry()
    {
        return FilterSystem.geometryPool.pop() || new Geometry();
    }

    /**
     * Destroys this Filter System.
     */
    destroy()
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
    getOptimalFilterTexture(minWidth, minHeight, resolution = 1)
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
    getFilterTexture(input, resolution)
    {
        if (typeof input === 'number')
        {
            const swap = input;

            input = resolution;
            resolution = swap;
        }
        if (input === undefined)
        {
            console.error('Warning: getFilterTexture without a reference texture '
                + 'is deprecated. It defaults to a texture of the same frame as output.');
            console.error(new Error().stack);
        }

        input = input || this.activeState.renderTexture;

        const filterTexture = this.texturePool.getOptimalTexture(input.width, input.height, resolution || input.resolution);

        filterTexture.filterFrame = this.outputFrame;

        return filterTexture;
    }

    /**
     * Frees a render texture back into the pool.
     *
     * @param {PIXI.RenderTexture} renderTexture - The renderTarget to free
     */
    returnFilterTexture(renderTexture)
    {
        this.texturePool.returnTexture(renderTexture);
    }

    /**
     * Empties the texture pool.
     */
    emptyPool()
    {
        this.texturePool.clear(true);
    }

    /**
     * calls `texturePool.resize()`, affects fullScreen renderTextures
     */
    resize()
    {
        this.texturePool.setScreenSize(this.renderer.view);
    }
}

/**
 * Pools of geometry objects for internal usage.
 * @member {PIXI.Geometry[]}
 * @private
 */
FilterSystem.geometryPool = [];
