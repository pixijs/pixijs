import WebGLSystem from '../WebGLSystem';

import RenderTexture from '../../../textures/RenderTexture';
import Quad from '../../utils/Quad';
import QuadUv from '../../utils/QuadUv';
import { Rectangle } from '@pixi/math';
import * as filterTransforms from '../../filters/filterTransforms';
import bitTwiddle from 'bit-twiddle';
import UniformGroup from '../../../shader/UniformGroup';
import { DRAW_MODES } from '../../../../../constants';

//
/**
 * @ignore
 * @class
 */
class FilterState
{
    /**
     *
     */
    constructor()
    {
        this.renderTexture = null;
        this.sourceFrame = new Rectangle();
        this.destinationFrame = new Rectangle();
        this.filters = [];
        this.target = null;
        this.resolution = 1;
    }
}

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGLSystem
 */
export default class FilterSystem extends WebGLSystem
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * stores a bunch of PO2 textures used for filtering
         * @type {Object}
         */
        this.texturePool = {};

        /**
         * a pool for storing filter states, save us creating new ones each tick
         * @type {Array}
         */
        this.statePool = [];

        /**
         * A very simple geometry used when drawing a filter effect to the screen
         * @type {Quad}
         */
        this.quad = new Quad();

        this.quadUv = new QuadUv();

        /**
         * Temporary rect for maths
         * @type {PIXI.Rectangle}
         */
        this.tempRect = new Rectangle();

        this.activeState = {};

        /**
         * this uniform group is attached to filter uniforms when used
         * @type {UniformGroup}
         */
        this.globalUniforms = new UniformGroup({
            sourceFrame: this.tempRect,
            destinationFrame: this.tempRect,

            // legacy variables
            filterArea: new Float32Array(4),
            filterClamp: new Float32Array(4),
        }, true);
    }

    /**
     * Adds a new filter to the System.
     *
     * @param {PIXI.DisplayObject} target - The target of the filter to render.
     * @param {PIXI.Filter[]} filters - The filters to apply.
     */
    push(target, filters)
    {
        const renderer = this.renderer;
        const filterStack = this.renderer.renderTexture.defaultFilterStack;
        const state = this.statePool.pop() || new FilterState();

        let resolution = filters[0].resolution;
        let padding = filters[0].padding;
        let autoFit = filters[0].autoFit;

        for (let i = 1; i < filters.length; i++)
        {
            // lets use the lowest resolution..
            resolution = Math.min(resolution, filters[i].resolution);
            // and the largest amount of padding!
            padding = Math.max(padding, filters[i].padding);
            // only auto fit if all filters are autofit
            autoFit = autoFit || filters[i].autoFit;
        }

        filterStack.push(state);

        state.resolution = resolution;

        // round to whole number based on resolution
        // TODO move that to the shader too?
        state.sourceFrame = target.filterArea || target.getBounds(true);

        state.sourceFrame.pad(padding);

        if (autoFit)
        {
            state.sourceFrame.fit(this.renderer.renderTexture.destinationFrame);
        }

        state.sourceFrame.round(resolution);

        state.renderTexture = this.getPotFilterTexture(state.sourceFrame.width, state.sourceFrame.height, resolution);
        state.filters = filters;

        state.destinationFrame.width = state.renderTexture.width;
        state.destinationFrame.height = state.renderTexture.height;

        state.renderTexture.filterFrame = state.sourceFrame;
        renderer.renderTexture.bind(state.renderTexture, state.sourceFrame);// /, state.destinationFrame);
        renderer.renderTexture.clear();
    }

    /**
     * Pops off the filter and applies it.
     *
     */
    pop()
    {
        const renderer = this.renderer;
        const filterStack = renderer.renderTexture.defaultFilterStack;
        const state = filterStack.pop();
        const filters = state.filters;

        this.activeState = state;

        const globalUniforms = this.globalUniforms.uniforms;

        globalUniforms.sourceFrame = state.sourceFrame;
        globalUniforms.destinationFrame = state.destinationFrame;
        globalUniforms.resolution = state.resolution;

        globalUniforms.filterArea[0] = state.destinationFrame.width;
        globalUniforms.filterArea[1] = state.destinationFrame.height;
        globalUniforms.filterArea[2] = state.sourceFrame.x;
        globalUniforms.filterArea[3] = state.sourceFrame.y;

        globalUniforms.filterClamp[0] = 0.5 / state.resolution / state.destinationFrame.width;
        globalUniforms.filterClamp[1] = 0.5 / state.resolution / state.destinationFrame.height;
        globalUniforms.filterClamp[2] = (state.sourceFrame.width - 0.5) / state.resolution
            / state.destinationFrame.width;
        globalUniforms.filterClamp[3] = (state.sourceFrame.height - 0.5) / state.resolution
            / state.destinationFrame.height;

        this.globalUniforms.update();

        const lastState = filterStack[filterStack.length - 1];

        if (filters.length === 1)
        {
            filters[0].apply(this, state.renderTexture, lastState.renderTexture, false, state);
            renderer.renderTexture.bind(null);

            this.returnFilterTexture(state.renderTexture);
        }
        else
        {
            let flip = state.renderTexture;
            let flop = this.getPotFilterTexture(
                flip.width,
                flip.height,
                state.resolution
            );

            flop.filterFrame = flip.filterFrame;

            let i = 0;

            for (i = 0; i < filters.length - 1; ++i)
            {
                filters[i].apply(this, flip, flop, true, state);

                const t = flip;

                flip = flop;
                flop = t;
            }

            filters[i].apply(this, flip, lastState.renderTexture, false, state);

            this.returnFilterTexture(flip);
            this.returnFilterTexture(flop);
        }

        this.statePool.push(state);
    }

    /**
     * Draws a filter.
     *
     * @param {PIXI.Filter} filter - The filter to draw.
     * @param {PIXI.RenderTarget} input - The input render target.
     * @param {PIXI.RenderTarget} output - The target to output to.
     * @param {boolean} clear - Should the output be cleared before rendering to it
     */
    applyFilter(filter, input, output, clear)
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

        renderer.state.setState(filter.state);
        renderer.shader.bind(filter);

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
     * Calculates the mapped matrix.
     *
     * TODO playing around here.. this is temporary - (will end up in the shader)
     * this returns a matrix that will normalise map filter cords in the filter to screen space
     *
     * @param {PIXI.Matrix} outputMatrix - the matrix to output to.
     * @return {PIXI.Matrix} The mapped matrix.
     */
    calculateScreenSpaceMatrix(outputMatrix)
    {
        const currentState = this.activeState;

        return filterTransforms.calculateScreenSpaceMatrix(
            outputMatrix,
            currentState.sourceFrame,
            currentState.destinationFrame
        );
    }

    /**
     * This will map the filter coord so that a texture can be used based on the transform of a sprite
     *
     * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
     * @param {PIXI.Sprite} sprite - The sprite to map to.
     * @return {PIXI.Matrix} The mapped matrix.
     */
    calculateSpriteMatrix(outputMatrix, sprite)
    {
        const currentState = this.activeState;

        return filterTransforms.calculateSpriteMatrix(
            outputMatrix,
            currentState.sourceFrame,
            currentState.destinationFrame,
            sprite
        );
    }

    /**
     * Destroys this Filter System.
     *
     * @param {boolean} [contextLost=false] context was lost, do not free shaders
     *
     */
    destroy(contextLost = false)
    {
        if (!contextLost)
        {
            this.emptyPool();
        }
        else
        {
            this.texturePool = {};
        }
    }

    /**
     * Gets a Power-of-Two render texture.
     *
     * TODO move to a seperate class could be on renderer?
     * also - could cause issue with multiple contexts?
     *
     * @private
     * @param {WebGLRenderingContext} gl - The webgl rendering context
     * @param {number} minWidth - The minimum width of the render target.
     * @param {number} minHeight - The minimum height of the render target.
     * @param {number} resolution - The resolution of the render target.
     * @return {PIXI.RenderTarget} The new render target.
     */
    getPotFilterTexture(minWidth, minHeight, resolution)
    {
        minWidth = bitTwiddle.nextPow2(minWidth);
        minHeight = bitTwiddle.nextPow2(minHeight);
        resolution = resolution || 1;

        const key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);

        if (!this.texturePool[key])
        {
            this.texturePool[key] = [];
        }

        let renderTexture = this.texturePool[key].pop();

        if (!renderTexture)
        {
            // temporary bypass cache..
            // internally - this will cause a texture to be bound..
            renderTexture = RenderTexture.create({
                width: minWidth,
                height: minHeight,
                resolution,
            });
        }

        return renderTexture;
    }

    /**
     * Gets extra render texture to use inside current filter. v4 compatibility
     *
     * @param {boolean} clear useless param, wasnt used in v4 too
     * @param {number} resolution resolution of the renderTexture
     * @returns {PIXI.RenderTexture}
     * @private
     */
    getRenderTarget(clear, resolution)
    {
        return this.getFilterTexture(resolution);
    }

    /**
     * Frees a render texture back into the pool. v4 compatibility
     *
     * @param {PIXI.RenderTexture} renderTexture - The renderTarget to free
     */
    returnRenderTarget(renderTexture)
    {
        this.returnFilterTexture(renderTexture);
    }

    /**
     * Gets extra render texture to use inside current filter
     *
     * @param {number} resolution resolution of the renderTexture
     * @returns {PIXI.RenderTexture}
     */
    getFilterTexture(resolution)
    {
        const rt = this.activeState.renderTexture;

        const filterTexture = this.getPotFilterTexture(rt.width, rt.height, resolution || rt.baseTexture.resolution);

        filterTexture.filterFrame = rt.filterFrame;

        return filterTexture;
    }

    /**
     * Frees a render texture back into the pool.
     *
     * @param {PIXI.RenderTarget} renderTexture - The renderTarget to free
     */
    returnFilterTexture(renderTexture)
    {
        renderTexture.filterFrame = null;

        const base = renderTexture.baseTexture;

        const minWidth = base.width;
        const minHeight = base.height;

        const key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);

        this.texturePool[key].push(renderTexture);
    }

    /**
     * Empties the texture pool.
     *
     */
    emptyPool()
    {
        for (const i in this.texturePool)
        {
            const textures = this.texturePool[i];

            if (textures)
            {
                for (let j = 0; j < textures.length; j++)
                {
                    textures[j].destroy(true);
                }
            }
        }

        this.texturePool = {};
    }
}
