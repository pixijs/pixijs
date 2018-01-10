import { TextureMatrix, Texture } from '@pixi/core';
import { Point, Rectangle, Transform } from '@pixi/math';
import { TextureCache } from '@pixi/utils';
import { Sprite } from '@pixi/sprite';

const tempPoint = new Point();

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */
export default class TilingSprite extends Sprite
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
         * @member {PIXI.Transform}
         */
        this.tileTransform = new Transform();

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
         * @member {PIXI.TextureMatrix}
         */
        this.uvTransform = texture.transform || new TextureMatrix(texture);

        /**
         * Plugin that is responsible for rendering this element.
         * Allows to customize the rendering process without overriding '_render' method.
         *
         * @member {string}
         * @default 'tilingSprite'
         */
        this.pluginName = 'tilingSprite';

        /**
         * Whether or not anchor affects uvs
         *
         * @member {boolean}
         * @default false
         */
        this.uvRespectAnchor = false;
    }
    /**
     * Changes frame clamping in corresponding textureTransform, shortcut
     * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
     *
     * @default 0.5
     * @member {number}
     */
    get clampMargin()
    {
        return this.uvTransform.clampMargin;
    }

    set clampMargin(value) // eslint-disable-line require-jsdoc
    {
        this.uvTransform.clampMargin = value;
        this.uvTransform.update(true);
    }

    /**
     * The scaling of the image that is being tiled
     *
     * @member {PIXI.ObservablePoint}
     */
    get tileScale()
    {
        return this.tileTransform.scale;
    }

    set tileScale(value) // eslint-disable-line require-jsdoc
    {
        this.tileTransform.scale.copyFrom(value);
    }

    /**
     * The offset of the image that is being tiled
     *
     * @member {PIXI.ObservablePoint}
     */
    get tilePosition()
    {
        return this.tileTransform.position;
    }

    set tilePosition(value) // eslint-disable-line require-jsdoc
    {
        this.tileTransform.position.copyFrom(value);
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
        this.cachedTint = 0xFFFFFF;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @private
     * @param {PIXI.Renderer} renderer - The renderer
     */
    _render(renderer)
    {
        // tweak our texture temporarily..
        const texture = this._texture;

        if (!texture || !texture.valid)
        {
            return;
        }

        this.tileTransform.updateLocalTransform();
        this.uvTransform.update();

        renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);
    }

    /**
     * Updates the bounds of the tiling sprite.
     *
     * @private
     */
    _calculateBounds()
    {
        const minX = this._width * -this._anchor._x;
        const minY = this._height * -this._anchor._y;
        const maxX = this._width * (1 - this._anchor._x);
        const maxY = this._height * (1 - this._anchor._y);

        this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
    }

    /**
     * Gets the local bounds of the sprite object.
     *
     * @param {PIXI.Rectangle} rect - The output rectangle.
     * @return {PIXI.Rectangle} The bounds.
     */
    getLocalBounds(rect)
    {
        // we can do a fast local bounds if the sprite has no children!
        if (this.children.length === 0)
        {
            this._bounds.minX = this._width * -this._anchor._x;
            this._bounds.minY = this._height * -this._anchor._y;
            this._bounds.maxX = this._width * (1 - this._anchor._x);
            this._bounds.maxY = this._height * (1 - this._anchor._x);

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
        const x1 = -width * this.anchor._x;

        if (tempPoint.x >= x1 && tempPoint.x < x1 + width)
        {
            const y1 = -height * this.anchor._y;

            if (tempPoint.y >= y1 && tempPoint.y < y1 + height)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Destroys this sprite and optionally its texture and children
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well
     */
    destroy(options)
    {
        super.destroy(options);

        this.tileTransform = null;
        this.uvTransform = null;
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
     * @return {PIXI.TilingSprite} A new TilingSprite using a texture from the texture cache matching the frameId
     */
    static fromFrame(frameId, width, height)
    {
        const texture = TextureCache[frameId];

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
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - if you want to specify the scale mode,
     *  see {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.TilingSprite} A new TilingSprite using a texture from the texture cache matching the image id
     */
    static fromImage(imageId, width, height, crossorigin, scaleMode)
    {
        return new TilingSprite(Texture.fromImage(imageId, crossorigin, scaleMode), width, height);
    }

    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width()
    {
        return this._width;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        this._width = value;
    }

    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height()
    {
        return this._height;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        this._height = value;
    }
}
