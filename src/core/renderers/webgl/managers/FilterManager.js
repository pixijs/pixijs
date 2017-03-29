import WebGLManager from './WebGLManager';
import RenderTarget from '../utils/RenderTarget';
import Quad from '../utils/Quad';
import { Rectangle } from '../../../math';
import Shader from '../../../Shader';
import * as filterTransforms from '../filters/filterTransforms';
import bitTwiddle from 'bit-twiddle';

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
        this.renderTarget = null;
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
 * @extends PIXI.WebGLManager
 */
export default class FilterManager extends WebGLManager
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this.gl = this.renderer.gl;
        // know about sprites!
        this.quad = new Quad(this.gl, renderer.state.attribState);

        this.shaderCache = {};
        // todo add default!
        this.pool = {};

        this.filterData = null;
    }

    /**
     * Adds a new filter to the manager.
     *
     * @param {PIXI.DisplayObject} target - The target of the filter to render.
     * @param {PIXI.Filter[]} filters - The filters to apply.
     */
    pushFilter(target, filters)
    {
        const renderer = this.renderer;

        let filterData = this.filterData;

        if (!filterData)
        {
            filterData = this.renderer._activeRenderTarget.filterStack;

            // add new stack
            const filterState = new FilterState();

            filterState.sourceFrame = filterState.destinationFrame = this.renderer._activeRenderTarget.size;
            filterState.renderTarget = renderer._activeRenderTarget;

            this.renderer._activeRenderTarget.filterData = filterData = {
                index: 0,
                stack: [filterState],
            };

            this.filterData = filterData;
        }

        // get the current filter state..
        let currentState = filterData.stack[++filterData.index];

        if (!currentState)
        {
            currentState = filterData.stack[filterData.index] = new FilterState();
        }

        // for now we go off the filter of the first resolution..
        const resolution = filters[0].resolution;
        const padding = filters[0].padding | 0;
        const targetBounds = target.filterArea || target.getBounds(true);
        const sourceFrame = currentState.sourceFrame;
        const destinationFrame = currentState.destinationFrame;

        sourceFrame.x = ((targetBounds.x * resolution) | 0) / resolution;
        sourceFrame.y = ((targetBounds.y * resolution) | 0) / resolution;
        sourceFrame.width = ((targetBounds.width * resolution) | 0) / resolution;
        sourceFrame.height = ((targetBounds.height * resolution) | 0) / resolution;

        if (filterData.stack[0].renderTarget.transform)
        { //

            // TODO we should fit the rect around the transform..
        }
        else if (filters[0].autoFit)
        {
            sourceFrame.fit(filterData.stack[0].destinationFrame);
        }

        // lets apply the padding After we fit the element to the screen.
        // this should stop the strange side effects that can occur when cropping to the edges
        sourceFrame.pad(padding);

        destinationFrame.width = sourceFrame.width;
        destinationFrame.height = sourceFrame.height;

        // lets play the padding after we fit the element to the screen.
        // this should stop the strange side effects that can occur when cropping to the edges

        const renderTarget = this.getPotRenderTarget(renderer.gl, sourceFrame.width, sourceFrame.height, resolution);

        currentState.target = target;
        currentState.filters = filters;
        currentState.resolution = resolution;
        currentState.renderTarget = renderTarget;

        // bind the render target to draw the shape in the top corner..

        renderTarget.setFrame(destinationFrame, sourceFrame);

        // bind the render target
        renderer.bindRenderTarget(renderTarget);
        renderTarget.clear();
    }

    /**
     * Pops off the filter and applies it.
     *
     */
    popFilter()
    {
        const filterData = this.filterData;

        const lastState = filterData.stack[filterData.index - 1];
        const currentState = filterData.stack[filterData.index];

        this.quad.map(currentState.renderTarget.size, currentState.sourceFrame).upload();

        const filters = currentState.filters;

        if (filters.length === 1)
        {
            filters[0].apply(this, currentState.renderTarget, lastState.renderTarget, false, currentState);
            this.freePotRenderTarget(currentState.renderTarget);
        }
        else
        {
            let flip = currentState.renderTarget;
            let flop = this.getPotRenderTarget(
                this.renderer.gl,
                currentState.sourceFrame.width,
                currentState.sourceFrame.height,
                currentState.resolution
            );

            flop.setFrame(currentState.destinationFrame, currentState.sourceFrame);

            // finally lets clear the render target before drawing to it..
            flop.clear();

            let i = 0;

            for (i = 0; i < filters.length - 1; ++i)
            {
                filters[i].apply(this, flip, flop, true, currentState);

                const t = flip;

                flip = flop;
                flop = t;
            }

            filters[i].apply(this, flip, lastState.renderTarget, false, currentState);

            this.freePotRenderTarget(flip);
            this.freePotRenderTarget(flop);
        }

        filterData.index--;

        if (filterData.index === 0)
        {
            this.filterData = null;
        }
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
        const gl = renderer.gl;

        let shader = filter.glShaders[renderer.CONTEXT_UID];

        // cacheing..
        if (!shader)
        {
            if (filter.glShaderKey)
            {
                shader = this.shaderCache[filter.glShaderKey];

                if (!shader)
                {
                    shader = new Shader(this.gl, filter.vertexSrc, filter.fragmentSrc);

                    filter.glShaders[renderer.CONTEXT_UID] = this.shaderCache[filter.glShaderKey] = shader;
                }
            }
            else
            {
                shader = filter.glShaders[renderer.CONTEXT_UID] = new Shader(this.gl, filter.vertexSrc, filter.fragmentSrc);
            }

            // TODO - this only needs to be done once?
            renderer.bindVao(null);

            this.quad.initVao(shader);
        }

        renderer.bindVao(this.quad.vao);

        renderer.bindRenderTarget(output);

        if (clear)
        {
            gl.disable(gl.SCISSOR_TEST);
            renderer.clear();// [1, 1, 1, 1]);
            gl.enable(gl.SCISSOR_TEST);
        }

        // in case the render target is being masked using a scissor rect
        if (output === renderer.maskManager.scissorRenderTarget)
        {
            renderer.maskManager.pushScissorMask(null, renderer.maskManager.scissorData);
        }

        renderer.bindShader(shader);

        // free unit 0 for us, doesn't matter what was there
        // don't try to restore it, because syncUniforms can upload it to another slot
        // and it'll be a problem
        const tex = this.renderer.emptyTextures[0];

        this.renderer.boundTextures[0] = tex;
        // this syncs the pixi filters  uniforms with glsl uniforms
        this.syncUniforms(shader, filter);

        renderer.state.setBlendMode(filter.blendMode);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, input.texture.texture);

        this.quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0);

        gl.bindTexture(gl.TEXTURE_2D, tex._glTextures[this.renderer.CONTEXT_UID].texture);
    }

    /**
     * Uploads the uniforms of the filter.
     *
     * @param {GLShader} shader - The underlying gl shader.
     * @param {PIXI.Filter} filter - The filter we are synchronizing.
     */
    syncUniforms(shader, filter)
    {
        const uniformData = filter.uniformData;
        const uniforms = filter.uniforms;

        // 0 is reserved for the pixi texture so we start at 1!
        let textureCount = 1;
        let currentState;

        // filterArea and filterClamp that are handled by FilterManager directly
        // they must not appear in uniformData

        if (shader.uniforms.filterArea)
        {
            currentState = this.filterData.stack[this.filterData.index];

            const filterArea = shader.uniforms.filterArea;

            filterArea[0] = currentState.renderTarget.size.width;
            filterArea[1] = currentState.renderTarget.size.height;
            filterArea[2] = currentState.sourceFrame.x;
            filterArea[3] = currentState.sourceFrame.y;

            shader.uniforms.filterArea = filterArea;
        }

        // use this to clamp displaced texture coords so they belong to filterArea
        // see displacementFilter fragment shader for an example
        if (shader.uniforms.filterClamp)
        {
            currentState = currentState || this.filterData.stack[this.filterData.index];

            const filterClamp = shader.uniforms.filterClamp;

            filterClamp[0] = 0;
            filterClamp[1] = 0;
            filterClamp[2] = (currentState.sourceFrame.width - 1) / currentState.renderTarget.size.width;
            filterClamp[3] = (currentState.sourceFrame.height - 1) / currentState.renderTarget.size.height;

            shader.uniforms.filterClamp = filterClamp;
        }

        // TODO Cacheing layer..
        for (const i in uniformData)
        {
            if (uniformData[i].type === 'sampler2D' && uniforms[i] !== 0)
            {
                if (uniforms[i].baseTexture)
                {
                    shader.uniforms[i] = this.renderer.bindTexture(uniforms[i].baseTexture, textureCount);
                }
                else
                {
                    shader.uniforms[i] = textureCount;

                    // TODO
                    // this is helpful as renderTargets can also be set.
                    // Although thinking about it, we could probably
                    // make the filter texture cache return a RenderTexture
                    // rather than a renderTarget
                    const gl = this.renderer.gl;

                    this.renderer.boundTextures[textureCount] = this.renderer.emptyTextures[textureCount];
                    gl.activeTexture(gl.TEXTURE0 + textureCount);

                    uniforms[i].texture.bind();
                }

                textureCount++;
            }
            else if (uniformData[i].type === 'mat3')
            {
                // check if its pixi matrix..
                if (uniforms[i].a !== undefined)
                {
                    shader.uniforms[i] = uniforms[i].toArray(true);
                }
                else
                {
                    shader.uniforms[i] = uniforms[i];
                }
            }
            else if (uniformData[i].type === 'vec2')
            {
                // check if its a point..
                if (uniforms[i].x !== undefined)
               {
                    const val = shader.uniforms[i] || new Float32Array(2);

                    val[0] = uniforms[i].x;
                    val[1] = uniforms[i].y;
                    shader.uniforms[i] = val;
                }
                else
               {
                    shader.uniforms[i] = uniforms[i];
                }
            }
            else if (uniformData[i].type === 'float')
            {
                if (shader.uniforms.data[i].value !== uniformData[i])
                {
                    shader.uniforms[i] = uniforms[i];
                }
            }
            else
            {
                shader.uniforms[i] = uniforms[i];
            }
        }
    }

    /**
     * Gets a render target from the pool, or creates a new one.
     *
     * @param {boolean} clear - Should we clear the render texture when we get it?
     * @param {number} resolution - The resolution of the target.
     * @return {PIXI.RenderTarget} The new render target
     */
    getRenderTarget(clear, resolution)
    {
        const currentState = this.filterData.stack[this.filterData.index];
        const renderTarget = this.getPotRenderTarget(
            this.renderer.gl,
            currentState.sourceFrame.width,
            currentState.sourceFrame.height,
            resolution || currentState.resolution
        );

        renderTarget.setFrame(currentState.destinationFrame, currentState.sourceFrame);

        return renderTarget;
    }

    /**
     * Returns a render target to the pool.
     *
     * @param {PIXI.RenderTarget} renderTarget - The render target to return.
     */
    returnRenderTarget(renderTarget)
    {
        this.freePotRenderTarget(renderTarget);
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
        const currentState = this.filterData.stack[this.filterData.index];

        return filterTransforms.calculateScreenSpaceMatrix(
            outputMatrix,
            currentState.sourceFrame,
            currentState.renderTarget.size
        );
    }

    /**
     * Multiply vTextureCoord to this matrix to achieve (0,0,1,1) for filterArea
     *
     * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
     * @return {PIXI.Matrix} The mapped matrix.
     */
    calculateNormalizedScreenSpaceMatrix(outputMatrix)
    {
        const currentState = this.filterData.stack[this.filterData.index];

        return filterTransforms.calculateNormalizedScreenSpaceMatrix(
            outputMatrix,
            currentState.sourceFrame,
            currentState.renderTarget.size,
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
        const currentState = this.filterData.stack[this.filterData.index];

        return filterTransforms.calculateSpriteMatrix(
            outputMatrix,
            currentState.sourceFrame,
            currentState.renderTarget.size,
            sprite
        );
    }

    /**
     * Destroys this Filter Manager.
     *
     */
    destroy()
    {
        this.shaderCache = {};
        this.emptyPool();
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
    getPotRenderTarget(gl, minWidth, minHeight, resolution)
    {
        // TODO you could return a bigger texture if there is not one in the pool?
        minWidth = bitTwiddle.nextPow2(minWidth * resolution);
        minHeight = bitTwiddle.nextPow2(minHeight * resolution);

        const key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);

        if (!this.pool[key])
        {
            this.pool[key] = [];
        }

        let renderTarget = this.pool[key].pop();

        // creating render target will cause texture to be bound!
        if (!renderTarget)
        {
            // temporary bypass cache..
            const tex = this.renderer.boundTextures[0];

            gl.activeTexture(gl.TEXTURE0);

            // internally - this will cause a texture to be bound..
            renderTarget = new RenderTarget(gl, minWidth, minHeight, null, 1);

            // set the current one back
            gl.bindTexture(gl.TEXTURE_2D, tex._glTextures[this.renderer.CONTEXT_UID].texture);
        }

        // manually tweak the resolution...
        // this will not modify the size of the frame buffer, just its resolution.
        renderTarget.resolution = resolution;
        renderTarget.defaultFrame.width = renderTarget.size.width = minWidth / resolution;
        renderTarget.defaultFrame.height = renderTarget.size.height = minHeight / resolution;

        return renderTarget;
    }

    /**
     * Empties the texture pool.
     *
     */
    emptyPool()
    {
        for (const i in this.pool)
        {
            const textures = this.pool[i];

            if (textures)
            {
                for (let j = 0; j < textures.length; j++)
                {
                    textures[j].destroy(true);
                }
            }
        }

        this.pool = {};
    }

    /**
     * Frees a render target back into the pool.
     *
     * @param {PIXI.RenderTarget} renderTarget - The renderTarget to free
     */
    freePotRenderTarget(renderTarget)
    {
        const minWidth = renderTarget.size.width * renderTarget.resolution;
        const minHeight = renderTarget.size.height * renderTarget.resolution;
        const key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);

        this.pool[key].push(renderTarget);
    }
}
