import * as core from '../core';
import Texture from '../core/textures/Texture';
import CanvasTinter from '../core/sprites/canvas/CanvasTinter';
import TilingShader from './webgl/TilingShader';

const tempArray = new Float32Array(4);
const tempPoint = new core.Point();

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 */
export default class TilingSprite extends core.Sprite
{
    /**
     * @param {PIXI.Texture} texture - the texture of the tiling sprite
     * @param {number} [width=100] - the width of the tiling sprite
     * @param {number} [height=100] - the height of the tiling sprite
     */
    constructor(texture, width = 100, height = 100)
    {
        super(texture);

        /**
         * The scaling of the image that is being tiled
         *
         * @member {PIXI.Point}
         */
        this.tileScale = new core.Point(1, 1);

        /**
         * The offset position of the image that is being tiled
         *
         * @member {PIXI.Point}
         */
        this.tilePosition = new core.Point(0, 0);

        // /// private

        /**
         * The with of the tiling sprite
         *
         * @member {number}
         * @private
         */
        this._width = width;

        /**
         * The height of the tiling sprite
         *
         * @member {number}
         * @private
         */
        this._height = height;

        /**
         * An internal WebGL UV cache.
         *
         * @member {PIXI.TextureUvs}
         * @private
         */
        this._uvs = new core.TextureUvs();

        this._canvasPattern = null;

        this._glDatas = [];
    }

    /**
     * @private
     */
    _onTextureUpdate()
    {
        return;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @private
     * @param {PIXI.WebGLRenderer} renderer - The renderer
     */
    _renderWebGL(renderer)
    {
        // tweak our texture temporarily..
        const texture = this._texture;

        if (!texture || !texture._uvs)
        {
            return;
        }

         // get rid of any thing that may be batching.
        renderer.flush();

        const gl = renderer.gl;
        let glData = this._glDatas[renderer.CONTEXT_UID];

        if (!glData)
        {
            glData = {
                shader: new TilingShader(gl),
                quad: new core.Quad(gl),
            };

            this._glDatas[renderer.CONTEXT_UID] = glData;

            glData.quad.initVao(glData.shader);
        }

        // if the sprite is trimmed and is not a tilingsprite then we need to add the extra space
        // before transforming the sprite coords..
        const vertices = glData.quad.vertices;

        vertices[0] = vertices[6] = (this._width) * -this.anchor.x;
        vertices[1] = vertices[3] = this._height * -this.anchor.y;

        vertices[2] = vertices[4] = (this._width) * (1 - this.anchor.x);
        vertices[5] = vertices[7] = this._height * (1 - this.anchor.y);

        glData.quad.upload();

        renderer.bindShader(glData.shader);

        const textureUvs = texture._uvs;
        const textureWidth = texture._frame.width;
        const textureHeight = texture._frame.height;
        const textureBaseWidth = texture.baseTexture.width;
        const textureBaseHeight = texture.baseTexture.height;

        const uPixelSize = glData.shader.uniforms.uPixelSize;

        uPixelSize[0] = 1.0 / textureBaseWidth;
        uPixelSize[1] = 1.0 / textureBaseHeight;
        glData.shader.uniforms.uPixelSize = uPixelSize;

        const uFrame = glData.shader.uniforms.uFrame;

        uFrame[0] = textureUvs.x0;
        uFrame[1] = textureUvs.y0;
        uFrame[2] = textureUvs.x1 - textureUvs.x0;
        uFrame[3] = textureUvs.y2 - textureUvs.y0;
        glData.shader.uniforms.uFrame = uFrame;

        const uTransform = glData.shader.uniforms.uTransform;

        uTransform[0] = (this.tilePosition.x % (textureWidth * this.tileScale.x)) / this._width;
        uTransform[1] = (this.tilePosition.y % (textureHeight * this.tileScale.y)) / this._height;
        uTransform[2] = (textureBaseWidth / this._width) * this.tileScale.x;
        uTransform[3] = (textureBaseHeight / this._height) * this.tileScale.y;
        glData.shader.uniforms.uTransform = uTransform;

        glData.shader.uniforms.translationMatrix = this.worldTransform.toArray(true);

        const color = tempArray;

        core.utils.hex2rgb(this.tint, color);
        color[3] = this.worldAlpha;

        glData.shader.uniforms.uColor = color;

        renderer.bindTexture(this._texture, 0);

        renderer.state.setBlendMode(this.blendMode);
        glData.quad.draw();
    }

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - a reference to the canvas renderer
     */
    _renderCanvas(renderer)
    {
        const texture = this._texture;

        if (!texture.baseTexture.hasLoaded)
        {
            return;
        }

        const context = renderer.context;
        const transform = this.worldTransform;
        const resolution = renderer.resolution;
        const baseTexture = texture.baseTexture;
        const modX = (this.tilePosition.x / this.tileScale.x) % texture._frame.width;
        const modY = (this.tilePosition.y / this.tileScale.y) % texture._frame.height;

        // create a nice shiny pattern!
        // TODO this needs to be refreshed if texture changes..
        if (!this._canvasPattern)
        {
            // cut an object from a spritesheet..
            const tempCanvas = new core.CanvasRenderTarget(texture._frame.width, texture._frame.height);

            // Tint the tiling sprite
            if (this.tint !== 0xFFFFFF)
            {
                if (this.cachedTint !== this.tint)
                {
                    this.cachedTint = this.tint;

                    this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
                }
                tempCanvas.context.drawImage(this.tintedTexture, 0, 0);
            }
            else
            {
                tempCanvas.context.drawImage(baseTexture.source, -texture._frame.x, -texture._frame.y);
            }
            this._canvasPattern = tempCanvas.context.createPattern(tempCanvas.canvas, 'repeat');
        }

        // set context state..
        context.globalAlpha = this.worldAlpha;
        context.setTransform(transform.a * resolution,
                           transform.b * resolution,
                           transform.c * resolution,
                           transform.d * resolution,
                           transform.tx * resolution,
                           transform.ty * resolution);

        // TODO - this should be rolled into the setTransform above..
        context.scale(this.tileScale.x, this.tileScale.y);

        context.translate(modX + (this.anchor.x * -this._width),
                          modY + (this.anchor.y * -this._height));

        // check blend mode
        const compositeOperation = renderer.blendModes[this.blendMode];

        if (compositeOperation !== renderer.context.globalCompositeOperation)
        {
            context.globalCompositeOperation = compositeOperation;
        }

        // fill the pattern!
        context.fillStyle = this._canvasPattern;
        context.fillRect(-modX,
                         -modY,
                         this._width / this.tileScale.x,
                         this._height / this.tileScale.y);
    }

    /**
     * Returns the framing rectangle of the sprite as a Rectangle object
    *
     * @return {PIXI.Rectangle} the framing rectangle
     */
    getBounds()
    {
        const width = this._width;
        const height = this._height;

        const w0 = width * (1 - this.anchor.x);
        const w1 = width * -this.anchor.x;

        const h0 = height * (1 - this.anchor.y);
        const h1 = height * -this.anchor.y;

        const worldTransform = this.worldTransform;

        const a = worldTransform.a;
        const b = worldTransform.b;
        const c = worldTransform.c;
        const d = worldTransform.d;
        const tx = worldTransform.tx;
        const ty = worldTransform.ty;

        const x1 = (a * w1) + (c * h1) + tx;
        const y1 = (d * h1) + (b * w1) + ty;

        const x2 = (a * w0) + (c * h1) + tx;
        const y2 = (d * h1) + (b * w0) + ty;

        const x3 = (a * w0) + (c * h0) + tx;
        const y3 = (d * h0) + (b * w0) + ty;

        const x4 =  (a * w1) + (c * h0) + tx;
        const y4 =  (d * h0) + (b * w1) + ty;

        let minX = 0;
        let maxX = 0;
        let minY = 0;
        let maxY = 0;

        minX = x1;
        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y1;
        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x1;
        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y1;
        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;

        const bounds = this._bounds;

        bounds.x = minX;
        bounds.width = maxX - minX;

        bounds.y = minY;
        bounds.height = maxY - minY;

        // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
        this._currentBounds = bounds;

        return bounds;
    }

    /**
     * Checks if a point is inside this tiling sprite.
     *
     * @param {PIXI.Point} point - the point to check
     * @return {boolean} Whether or not the sprite contains the point.
     */
    containsPoint(point)
    {
        this.worldTransform.applyInverse(point, tempPoint);

        const width = this._width;
        const height = this._height;
        const x1 = -width * this.anchor.x;

        if (tempPoint.x > x1 && tempPoint.x < x1 + width)
        {
            const y1 = -height * this.anchor.y;

            if (tempPoint.y > y1 && tempPoint.y < y1 + height)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Destroys this tiling sprite
     *
     */
    destroy()
    {
        super.destroy();

        this.tileScale = null;
        this._tileScaleOffset = null;
        this.tilePosition = null;

        this._uvs = null;
    }

    /**
     * Helper function that creates a new tiling sprite based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {number|string|PIXI.BaseTexture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
     * @param {number} width - the width of the tiling sprite
     * @param {number} height - the height of the tiling sprite
     * @return {PIXI.Texture} The newly created texture
     */
    static from(source, width, height)
    {
        return new TilingSprite(Texture.from(source), width, height);
    }

    /**
     * Helper function that creates a tiling sprite that will use a texture from the TextureCache based on the frameId
     * The frame ids are created when a Texture packer file has been loaded
     *
     * @static
     * @param {string} frameId - The frame Id of the texture in the cache
     * @param {number} width - the width of the tiling sprite
     * @param {number} height - the height of the tiling sprite
     * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the frameId
     */
    static fromFrame(frameId, width, height)
    {
        const texture = core.utils.TextureCache[frameId];

        if (!texture)
        {
            throw new Error(`The frameId "${frameId}" does not exist in the texture cache ${this}`);
        }

        return new TilingSprite(texture, width, height);
    }

    /**
     * Helper function that creates a sprite that will contain a texture based on an image url
     * If the image is not in the texture cache it will be loaded
     *
     * @static
     * @param {string} imageId - The image url of the texture
     * @param {number} width - the width of the tiling sprite
     * @param {number} height - the height of the tiling sprite
     * @param {boolean} [crossorigin] - if you want to specify the cross-origin parameter
     * @param {number} [scaleMode=PIXI.SCALE_MODES.DEFAULT] - if you want to specify the scale mode,
     *  see {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the image id
     */
    static fromImage(imageId, width, height, crossorigin, scaleMode)
    {
        return new TilingSprite(core.Texture.fromImage(imageId, crossorigin, scaleMode), width, height);
    }

    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.extras.TilingSprite#
     */
    get width()
    {
        return this._width;
    }

    /**
     * Sets the width.
     *
     * @param {number} value - The value to set to.
     */
    set width(value)
    {
        this._width = value;
    }

    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.extras.TilingSprite#
     */
    get height()
    {
        return this._height;
    }

    /**
     * Sets the width.
     *
     * @param {number} value - The value to set to.
     */
    set height(value)
    {
        this._height = value;
    }
}
