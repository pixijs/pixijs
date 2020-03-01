import { Texture, TextureMatrix } from '@pixi/core';
import { Point, Rectangle, Transform  } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { deprecation } from '@pixi/utils';
import type { Renderer, IBaseTextureOptions, TextureSource } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import type { IPoint, ISize, ObservablePoint } from '@pixi/math';

const tempPoint = new Point();

/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */
export class TilingSprite extends Sprite
{
    public tileTransform: Transform;
    public uvMatrix: TextureMatrix;
    public uvRespectAnchor: boolean;

    /**
     * @param {PIXI.Texture} texture - the texture of the tiling sprite
     * @param {number} [width=100] - the width of the tiling sprite
     * @param {number} [height=100] - the height of the tiling sprite
     */
    constructor(texture: Texture, width = 100, height = 100)
    {
        super(texture);

        /**
         * Tile transform
         *
         * @member {PIXI.Transform}
         */
        this.tileTransform = new Transform();

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
         * matrix that is applied to UV to get the coords in Texture normalized space to coords in BaseTexture space
         *
         * @member {PIXI.TextureMatrix}
         */
        this.uvMatrix = texture.uvMatrix || new TextureMatrix(texture);

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
    get clampMargin(): number
    {
        return this.uvMatrix.clampMargin;
    }

    set clampMargin(value) // eslint-disable-line require-jsdoc
    {
        this.uvMatrix.clampMargin = value;
        this.uvMatrix.update(true);
    }

    /**
     * The scaling of the image that is being tiled
     *
     * @member {PIXI.ObservablePoint}
     */
    get tileScale(): ObservablePoint
    {
        return this.tileTransform.scale;
    }

    set tileScale(value) // eslint-disable-line require-jsdoc
    {
        this.tileTransform.scale.copyFrom(value as IPoint);
    }

    /**
     * The offset of the image that is being tiled
     *
     * @member {PIXI.ObservablePoint}
     */
    get tilePosition(): ObservablePoint
    {
        return this.tileTransform.position;
    }

    set tilePosition(value) // eslint-disable-line require-jsdoc
    {
        this.tileTransform.position.copyFrom(value as IPoint);
    }

    /**
     * @protected
     */
    protected _onTextureUpdate(): void
    {
        if (this.uvMatrix)
        {
            this.uvMatrix.texture = this._texture;
        }
        this._cachedTint = 0xFFFFFF;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    protected _render(renderer: Renderer): void
    {
        // tweak our texture temporarily..
        const texture = this._texture;

        if (!texture || !texture.valid)
        {
            return;
        }

        this.tileTransform.updateLocalTransform();
        this.uvMatrix.update();

        renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);
    }

    /**
     * Updates the bounds of the tiling sprite.
     *
     * @protected
     */
    protected _calculateBounds(): void
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
    public getLocalBounds(rect: Rectangle): Rectangle
    {
        // we can do a fast local bounds if the sprite has no children!
        if (this.children.length === 0)
        {
            this._bounds.minX = this._width * -this._anchor._x;
            this._bounds.minY = this._height * -this._anchor._y;
            this._bounds.maxX = this._width * (1 - this._anchor._x);
            this._bounds.maxY = this._height * (1 - this._anchor._y);

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
     * @param {PIXI.IPoint} point - the point to check
     * @return {boolean} Whether or not the sprite contains the point.
     */
    public containsPoint(point: IPoint): boolean
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
    public destroy(options: IDestroyOptions|boolean): void
    {
        super.destroy(options);

        this.tileTransform = null;
        this.uvMatrix = null;
    }

    /**
     * Helper function that creates a new tiling sprite based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {string|PIXI.Texture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
     * @param {Object} options - See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {number} options.width - required width of the tiling sprite
     * @param {number} options.height - required height of the tiling sprite
     * @return {PIXI.TilingSprite} The newly created texture
     */
    static from(source: TextureSource, options: ISize & IBaseTextureOptions): TilingSprite
    {
        // Deprecated
        if (typeof options === 'number')
        {
            deprecation('5.3.0', 'TilingSprite.from use options instead of width and height args');
            // eslint-disable-next-line prefer-rest-params
            options = { width: options, height: arguments[2] } as ISize;
        }

        return new TilingSprite(
            Texture.from(source, options),
            options.width,
            options.height
        );
    }

    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width(): number
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
    get height(): number
    {
        return this._height;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        this._height = value;
    }
}
