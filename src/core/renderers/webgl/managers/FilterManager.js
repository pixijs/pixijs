import WebGLManager from './WebGLManager';
import RenderTarget from '../utils/RenderTarget';
import Quad from '../utils/Quad';
import math from '../../../math';
import Shader from '../../../Shader';
import filterTransforms from '../filters/filterTransforms';
import bitTwiddle from 'bit-twiddle';

class FilterState
{
    constructor()
    {
        this.renderTarget = null;
        this.sourceFrame = new math.Rectangle();
        this.destinationFrame = new math.Rectangle();
        this.filters = [];
        this.target = null;
        this.resolution = 1;
    }
}

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGLManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
class FilterManager extends WebGLManager
{
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

    pushFilter(target, filters)
    {
        const renderer = this.renderer;

        let filterData = this.filterData;

        if(!filterData)
        {
            filterData = this.renderer._activeRenderTarget.filterStack;

            // add new stack
            const filterState = new FilterState();
            filterState.sourceFrame = filterState.destinationFrame = this.renderer._activeRenderTarget.size;
            filterState.renderTarget = renderer._activeRenderTarget;

            this.renderer._activeRenderTarget.filterData = filterData = {
                index:0,
                stack:[filterState]
            };

            this.filterData = filterData;
        }

        // get the current filter state..
        let currentState = filterData.stack[++filterData.index];
        if(!currentState)
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

          // lets pplay the padding After we fit the element to the screen.
        // this should stop the strange side effects that can occour when cropping to the edges
        sourceFrame.pad(padding);

        if(filterData.stack[0].renderTarget.transform)
        {//jshint ignore:line

            // TODO we should fit the rect around the transform..
        }
        else
        {

            sourceFrame.fit(filterData.stack[0].destinationFrame);
        }


        destinationFrame.width = sourceFrame.width;
        destinationFrame.height = sourceFrame.height;

        // lets play the padding after we fit the element to the screen.
        // this should stop the strange side effects that can occour when cropping to the edges

        const renderTarget = this.getPotRenderTarget(renderer.gl, sourceFrame.width, sourceFrame.height, resolution);

        currentState.target = target;
        currentState.filters = filters;
        currentState.resolution = resolution;
        currentState.renderTarget = renderTarget;

        // bind the render taget to draw the shape in the top corner..

        renderTarget.setFrame(destinationFrame, sourceFrame);
        // bind the render target
        renderer.bindRenderTarget(renderTarget);

        // clear the renderTarget
        renderer.clear();//[0.5,0.5,0.5, 1.0]);
    }

    popFilter()
    {
        const filterData = this.filterData;

        const lastState = filterData.stack[filterData.index-1];
        const currentState = filterData.stack[filterData.index];

        this.quad.map(currentState.renderTarget.size, currentState.sourceFrame).upload();

        const filters = currentState.filters;

        if(filters.length === 1)
        {
            filters[0].apply(this, currentState.renderTarget, lastState.renderTarget, false);
            this.freePotRenderTarget(currentState.renderTarget);
        }
        else
        {
            let flip = currentState.renderTarget;
            let flop = this.getPotRenderTarget(this.renderer.gl, currentState.sourceFrame.width, currentState.sourceFrame.height, 1);
            flop.setFrame(currentState.destinationFrame, currentState.sourceFrame);

            let i=0;
            for (i; i < filters.length-1; i++)
            {
                filters[i].apply(this, flip, flop, true);

                let t = flip;
                flip = flop;
                flop = t;
            }
            filters[i].apply(this, flip, lastState.renderTarget, false);

            this.freePotRenderTarget(flip);
            this.freePotRenderTarget(flop);
        }

        filterData.index--;

        if(filterData.index === 0)
        {
            this.filterData = null;
        }
    }

    applyFilter(filter, input, output, clear)
    {
        const renderer = this.renderer;
        let shader = filter.glShaders[renderer.CONTEXT_UID];

        // cacheing..
        if(!shader)
        {
            if(filter.glShaderKey)
            {
                shader = this.shaderCache[filter.glShaderKey];

                if(!shader)
                {
                    shader = filter.glShaders[renderer.CONTEXT_UID] = this.shaderCache[filter.glShaderKey] = new Shader(this.gl, filter.vertexSrc, filter.fragmentSrc);
                }
            }
            else
            {
                shader = filter.glShaders[renderer.CONTEXT_UID] = new Shader(this.gl, filter.vertexSrc, filter.fragmentSrc);
            }

            //TODO - this only needs to be done once?
            this.quad.initVao(shader);
        }

        renderer.bindRenderTarget(output);



        if(clear)
        {
            const gl = renderer.gl;

            gl.disable(gl.SCISSOR_TEST);
            renderer.clear();//[1, 1, 1, 1]);
            gl.enable(gl.SCISSOR_TEST);
        }

        // in case the render target is being masked using a scissor rect
        if(output === renderer.maskManager.scissorRenderTarget)
        {
            renderer.maskManager.pushScissorMask(null, renderer.maskManager.scissorData);
        }

        renderer.bindShader(shader);

        // this syncs the pixi filters  uniforms with glsl uniforms
        this.syncUniforms(shader, filter);

        // bind the input texture..
        input.texture.bind(0);
        // when you manually bind a texture, please switch active texture location to it
        renderer._activeTextureLocation = 0;

        renderer.state.setBlendMode( filter.blendMode );

        this.quad.draw();
    }

    // this returns a matrix that will normalise map filter cords in the filter to screen space
    syncUniforms(shader, filter)
    {
        const uniformData = filter.uniformData;
        const uniforms = filter.uniforms;

        // 0 is reserverd for the pixi texture so we start at 1!
        let textureCount = 1;
        let currentState;

        if(shader.uniforms.data.filterArea)
        {
            currentState = this.filterData.stack[this.filterData.index];
            let filterArea = shader.uniforms.filterArea;

            filterArea[0] = currentState.renderTarget.size.width;
            filterArea[1] = currentState.renderTarget.size.height;
            filterArea[2] = currentState.sourceFrame.x;
            filterArea[3] = currentState.sourceFrame.y;

            shader.uniforms.filterArea = filterArea;
        }

        // use this to clamp displaced texture coords so they belong to filterArea
        // see displacementFilter fragment shader for an example
        if(shader.uniforms.data.filterClamp)
        {
            currentState = this.filterData.stack[this.filterData.index];
            let filterClamp = shader.uniforms.filterClamp;

            filterClamp[0] = 0.5 / currentState.renderTarget.size.width;
            filterClamp[1] = 0.5 / currentState.renderTarget.size.height;
            filterClamp[2] = (currentState.sourceFrame.width - 0.5) / currentState.renderTarget.size.width;
            filterClamp[3] = (currentState.sourceFrame.height - 0.5) / currentState.renderTarget.size.height;

            shader.uniforms.filterClamp = filterClamp;
        }

        let val;
        //TODO Cacheing layer..
        for(let i in uniformData)
        {
            if(uniformData[i].type === 'sampler2D')
            {
                shader.uniforms[i] = textureCount;

                if(uniforms[i].baseTexture)
                {
                    this.renderer.bindTexture(uniforms[i].baseTexture, textureCount);
                }
                else
                {
                    // this is helpful as renderTargets can also be set.
                    // Although thinking about it, we could probably
                    // make the filter texture cache return a RenderTexture
                    // rather than a renderTarget
                    const gl = this.renderer.gl;
                    this.renderer._activeTextureLocation = gl.TEXTURE0 + textureCount;
                    gl.activeTexture(gl.TEXTURE0 + textureCount );
                    uniforms[i].texture.bind();
                }

                textureCount++;
            }
            else if(uniformData[i].type === 'mat3')
            {
                // check if its pixi matrix..
                if(uniforms[i].a !== undefined)
                {
                    shader.uniforms[i] = uniforms[i].toArray(true);
                }
                else
                {
                    shader.uniforms[i] = uniforms[i];
                }
            }
            else if(uniformData[i].type === 'vec2')
            {
                //check if its a point..
               if(uniforms[i].x !== undefined)
               {
                    val = shader.uniforms[i] || new Float32Array(2);
                    val[0] = uniforms[i].x;
                    val[1] = uniforms[i].y;
                    shader.uniforms[i] = val;
               }
               else
               {
                    shader.uniforms[i] = uniforms[i];
               }
            }
            else if(uniformData[i].type === 'float')
            {
                if(shader.uniforms.data[i].value !== uniformData[i])
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


    getRenderTarget(clear, resolution)
    {
        const currentState = this.filterData.stack[this.filterData.index];
        const renderTarget = this.getPotRenderTarget(this.renderer.gl, currentState.sourceFrame.width, currentState.sourceFrame.height, resolution || currentState.resolution);
        renderTarget.setFrame(currentState.destinationFrame, currentState.sourceFrame);

        return renderTarget;
    }

    returnRenderTarget(renderTarget)
    {
        return this.freePotRenderTarget(renderTarget);
    }

    /*
     * Calculates the mapped matrix
     * @param filterArea {Rectangle} The filter area
     * @param sprite {Sprite} the target sprite
     * @param outputMatrix {Matrix} @alvin
     */
    // TODO playing around here.. this is temporary - (will end up in the shader)
    // thia returns a matrix that will normalise map filter cords in the filter to screen space
    calculateScreenSpaceMatrix(outputMatrix)
    {
        const currentState = this.filterData.stack[this.filterData.index];
        return filterTransforms.calculateScreenSpaceMatrix(outputMatrix,  currentState.sourceFrame, currentState.renderTarget.size);
    }

    /**
     * Multiply vTextureCoord to this matrix to achieve (0,0,1,1) for filterArea
     *
     * @param outputMatrix {PIXI.Matrix}
     */
    calculateNormalizedScreenSpaceMatrix(outputMatrix)
    {
        const currentState = this.filterData.stack[this.filterData.index];

        return filterTransforms.calculateNormalizedScreenSpaceMatrix(outputMatrix, currentState.sourceFrame, currentState.renderTarget.size, currentState.destinationFrame);
    }

    // this will map the filter coord so that a texture can be used based on the transform of a sprite
    calculateSpriteMatrix(outputMatrix, sprite)
    {
        const currentState = this.filterData.stack[this.filterData.index];
        return filterTransforms.calculateSpriteMatrix(outputMatrix, currentState.sourceFrame, currentState.renderTarget.size, sprite);
    }

    destroy()
    {
         this.shaderCache = [];
         this.emptyPool();
    }



    //TODO move to a seperate class could be on renderer?
    //also - could cause issue with multiple contexts?
    getPotRenderTarget(gl, minWidth, minHeight, resolution)
    {
        //TODO you coud return a bigger texture if there is not one in the pool?
        minWidth = bitTwiddle.nextPow2(minWidth * resolution);
        minHeight = bitTwiddle.nextPow2(minHeight * resolution);

        const key = ((minWidth & 0xFFFF) << 16) | ( minHeight & 0xFFFF);

        if(!this.pool[key]) {
          this.pool[key] = [];
        }

        const renderTarget = this.pool[key].pop() || new RenderTarget(gl, minWidth, minHeight, null, 1);

        //manually tweak the resolution...
        //this will not modify the size of the frame buffer, just its resolution.
        renderTarget.resolution = resolution;
        renderTarget.defaultFrame.width = renderTarget.size.width = minWidth / resolution;
        renderTarget.defaultFrame.height = renderTarget.size.height = minHeight / resolution;
        return renderTarget;
    }

    emptyPool()
    {
        for (let i in this.pool)
        {
            let textures = this.pool[i];
            if(textures)
            {
                for (let j = 0; j < textures.length; j++)
                {
                    textures[j].destroy(true);
                }
            }
        }

        this.pool = {};
    }

    freePotRenderTarget(renderTarget)
    {
        const minWidth = renderTarget.size.width * renderTarget.resolution;
        const minHeight = renderTarget.size.height * renderTarget.resolution;

        const key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);
        this.pool[key].push(renderTarget);
    }
}

export default FilterManager;
