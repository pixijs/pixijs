import { Rectangle, Matrix } from '../../../math';
import { SCALE_MODES } from '../../../const';
import settings from '../../../settings';
import { GLFramebuffer } from 'pixi-gl-core';

/**
 * @class
 * @memberof PIXI
 */
export default class RenderTarget
{
    /**
     * @param {WebGLRenderingContext} gl - The current WebGL drawing context
     * @param {number} [width=0] - the horizontal range of the filter
     * @param {number} [height=0] - the vertical range of the filter
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @param {number} [resolution=1] - The current resolution / device pixel ratio
     * @param {boolean} [root=false] - Whether this object is the root element or not
     */
    constructor(gl, width, height, scaleMode, resolution, root)
    {
        // TODO Resolution could go here ( eg low res blurs )

        /**
         * The current WebGL drawing context.
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        // next time to create a frame buffer and texture

        /**
         * A frame buffer
         *
         * @member {PIXI.glCore.GLFramebuffer}
         */
        this.frameBuffer = null;

        /**
         * The texture
         *
         * @member {PIXI.glCore.GLTexture}
         */
        this.texture = null;

        /**
         * The background colour of this render target, as an array of [r,g,b,a] values
         *
         * @member {number[]}
         */
        this.clearColor = [0, 0, 0, 0];

        /**
         * The size of the object as a rectangle
         *
         * @member {PIXI.Rectangle}
         */
        this.size = new Rectangle(0, 0, 1, 1);

        /**
         * The current resolution / device pixel ratio
         *
         * @member {number}
         * @default 1
         */
        this.resolution = resolution || settings.RESOLUTION;

        /**
         * The projection matrix
         *
         * @member {PIXI.Matrix}
         */
        this.projectionMatrix = new Matrix();

        /**
         * The object's transform
         *
         * @member {PIXI.Matrix}
         */
        this.transform = null;

        /**
         * The frame.
         *
         * @member {PIXI.Rectangle}
         */
        this.frame = null;

        /**
         * The stencil buffer stores masking data for the render target
         *
         * @member {glCore.GLBuffer}
         */
        this.defaultFrame = new Rectangle();
        this.destinationFrame = null;
        this.sourceFrame = null;

        /**
         * The stencil buffer stores masking data for the render target
         *
         * @member {glCore.GLBuffer}
         */
        this.stencilBuffer = null;

        /**
         * The data structure for the stencil masks
         *
         * @member {PIXI.Graphics[]}
         */
        this.stencilMaskStack = [];

        /**
         * Stores filter data for the render target
         *
         * @member {object[]}
         */
        this.filterData = null;

        /**
         * The scale mode.
         *
         * @member {number}
         * @default PIXI.settings.SCALE_MODE
         * @see PIXI.SCALE_MODES
         */
        this.scaleMode = scaleMode !== undefined ? scaleMode : settings.SCALE_MODE;

        /**
         * Whether this object is the root element or not
         *
         * @member {boolean}
         */
        this.root = root;

        if (!this.root)
        {
            this.frameBuffer = GLFramebuffer.createRGBA(gl, 100, 100);

            if (this.scaleMode === SCALE_MODES.NEAREST)
            {
                this.frameBuffer.texture.enableNearestScaling();
            }
            else
            {
                this.frameBuffer.texture.enableLinearScaling();
            }
            /*
                A frame buffer needs a target to render to..
                create a texture and bind it attach it to the framebuffer..
             */

            // this is used by the base texture
            this.texture = this.frameBuffer.texture;
        }
        else
        {
            // make it a null framebuffer..
            this.frameBuffer = new GLFramebuffer(gl, 100, 100);
            this.frameBuffer.framebuffer = null;
        }

        this.setFrame();

        this.resize(width, height);
    }

    /**
     * Clears the filter texture.
     *
     * @param {number[]} [clearColor=this.clearColor] - Array of [r,g,b,a] to clear the framebuffer
     */
    clear(clearColor)
    {
        const cc = clearColor || this.clearColor;

        this.frameBuffer.clear(cc[0], cc[1], cc[2], cc[3]);// r,g,b,a);
    }

    /**
     * Binds the stencil buffer.
     *
     */
    attachStencilBuffer()
    {
        // TODO check if stencil is done?
        /**
         * The stencil buffer is used for masking in pixi
         * lets create one and then add attach it to the framebuffer..
         */
        if (!this.root)
        {
            this.frameBuffer.enableStencil();
        }
    }

    /**
     * Sets the frame of the render target.
     *
     * @param {Rectangle} destinationFrame - The destination frame.
     * @param {Rectangle} sourceFrame - The source frame.
     */
    setFrame(destinationFrame, sourceFrame)
    {
        this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
        this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;
    }

    /**
     * Binds the buffers and initialises the viewport.
     *
     */
    activate()
    {
        // TOOD refactor usage of frame..
        const gl = this.gl;

        // make sure the texture is unbound!
        this.frameBuffer.bind();

        this.calculateProjection(this.destinationFrame, this.sourceFrame);

        if (this.transform)
        {
            this.projectionMatrix.append(this.transform);
        }

        // TODO add a check as them may be the same!
        if (this.destinationFrame !== this.sourceFrame)
        {
            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(
                this.destinationFrame.x | 0,
                this.destinationFrame.y | 0,
                (this.destinationFrame.width * this.resolution) | 0,
                (this.destinationFrame.height * this.resolution) | 0
            );
        }
        else
        {
            gl.disable(gl.SCISSOR_TEST);
        }

        // TODO - does not need to be updated all the time??
        gl.viewport(
            this.destinationFrame.x | 0,
            this.destinationFrame.y | 0,
            (this.destinationFrame.width * this.resolution) | 0,
            (this.destinationFrame.height * this.resolution) | 0
        );
    }

    /**
     * Updates the projection matrix based on a projection frame (which is a rectangle)
     *
     * @param {Rectangle} destinationFrame - The destination frame.
     * @param {Rectangle} sourceFrame - The source frame.
     */
    calculateProjection(destinationFrame, sourceFrame)
    {
        const pm = this.projectionMatrix;

        sourceFrame = sourceFrame || destinationFrame;

        pm.identity();

        // TODO: make dest scale source
        if (!this.root)
        {
            pm.a = 1 / destinationFrame.width * 2;
            pm.d = 1 / destinationFrame.height * 2;

            pm.tx = -1 - (sourceFrame.x * pm.a);
            pm.ty = -1 - (sourceFrame.y * pm.d);
        }
        else
        {
            pm.a = 1 / destinationFrame.width * 2;
            pm.d = -1 / destinationFrame.height * 2;

            pm.tx = -1 - (sourceFrame.x * pm.a);
            pm.ty = 1 - (sourceFrame.y * pm.d);
        }
    }

    /**
     * Resizes the texture to the specified width and height
     *
     * @param {number} width - the new width of the texture
     * @param {number} height - the new height of the texture
     */
    resize(width, height)
    {
        width = width | 0;
        height = height | 0;

        if (this.size.width === width && this.size.height === height)
        {
            return;
        }

        this.size.width = width;
        this.size.height = height;

        this.defaultFrame.width = width;
        this.defaultFrame.height = height;

        this.frameBuffer.resize(width * this.resolution, height * this.resolution);

        const projectionFrame = this.frame || this.size;

        this.calculateProjection(projectionFrame);
    }

    /**
     * Destroys the render target.
     *
     */
    destroy()
    {
        this.frameBuffer.destroy();

        this.frameBuffer = null;
        this.texture = null;
    }
}
