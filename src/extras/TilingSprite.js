import * as core from '../core';
import CanvasTinter from '../core/sprites/canvas/CanvasTinter';
import { default as TextureTransform } from './TextureTransform';

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
         * Tile transform
         *
         * @member {PIXI.TransformStatic}
         */
        this.tileTransform = new core.TransformStatic();

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
         * Canvas pattern
         *
         * @type {CanvasPattern}
         * @private
         */
        this._canvasPattern = null;

        /**
         * transform that is applied to UV to get the texture coords
         *
         * @member {PIXI.extras.TextureTransform}
         */
        this.uvTransform = texture.transform || new TextureTransform(texture);
    }

    /**
     * setter for clampEdge
     *
     * @param {number} value assigned value
     */
    set clampEdge(value)
    {
        this.uvTransform.clampEdge = value;
        this.uvTransform.update(true);
    }

    /**
     * The scaling of the image that is being tiled
     *
     * @member {PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    get tileScale()
    {
        return this.tileTransform.scale;
    }

    /**
     * Copies the point to the scale of the tiled image.
     *
     * @param {PIXI.Point|PIXI.ObservablePoint} value - The value to set to.
     */
    set tileScale(value)
    {
        this.tileTransform.scale.copy(value);
    }

    /**
     * The offset of the image that is being tiled
     *
     * @member {PIXI.ObservablePoint}
     * @memberof PIXI.TilingSprite#
     */
    get tilePosition()
    {
        return this.tileTransform.position;
    }

    /**
     * Copies the point to the position of the tiled image.
     *
     * @param {PIXI.Point|PIXI.ObservablePoint} value - The value to set to.
     */
    set tilePosition(value)
    {
        this.tileTransform.position.copy(value);
    }

    /**
     * @private
     */
    _onTextureUpdate()
    {
        if (this.uvTransform)
        {
            this.uvTransform.texture = this._texture;
        }
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

        if (!texture || !texture.valid)
        {
            return;
        }

        this.tileTransform.updateLocalTransform();
        this.uvTransform.update();

        renderer.setObjectRenderer(renderer.plugins.tiling);
        renderer.plugins.tilingSprite.render(this);
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
     * Gets the local bounds of the sprite object.
     *
     * @param {Rectangle} rect - The output rectangle.
     * @return {Rectangle} The bounds.
     */
    getLocalBounds(rect)
    {
        // we can do a fast local bounds if the sprite has no children!
        if (this.children.length === 0)
        {
            this._bounds.minX = -this._width * this.anchor._x;
            this._bounds.minY = -this._height * this.anchor._y;
            this._bounds.maxX = this._width;
            this._bounds.maxY = this._height;

            if (!rect)
            {
                if (!this._localBoundsRect)
                {
                    this._localBoundsRect = new Rectangle();
                }

                rect = this._localBoundsRect;
            }

            return this._bounds.getRectangle(rect);
        }

        return super.getLocalBounds.call(this, rect);
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
        this.tilePosition = null;
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
        return new TilingSprite(core.Texture.from(source), width, height);
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
