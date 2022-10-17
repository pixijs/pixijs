import { Point, Rectangle, Transform, Texture, TextureMatrix } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import type { IPoint, IPointData, ISize, ObservablePoint, Renderer, IBaseTextureOptions, TextureSource } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';

const tempPoint = new Point();

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TilingSprite extends GlobalMixins.TilingSprite {}

/**
 * A tiling sprite is a fast way of rendering a tiling image.
 * @memberof PIXI
 */
export class TilingSprite extends Sprite
{
    /** Tile transform */
    public tileTransform: Transform;

    /** Matrix that is applied to UV to get the coords in Texture normalized space to coords in BaseTexture space. */
    public uvMatrix: TextureMatrix;

    /**
     * Flags whether the tiling pattern should originate from the origin instead of the top-left corner in
     * local space.
     *
     * This will make the texture coordinates assigned to each vertex dependent on the value of the anchor. Without
     * this, the top-left corner always gets the (0, 0) texture coordinate.
     * @default false
     */
    public uvRespectAnchor: boolean;

    /**
     * Note: The wrap mode of the texture is forced to REPEAT on render if the size of the texture
     * is a power of two, the texture's wrap mode is CLAMP, and the texture hasn't been bound yet.
     * @param texture - The texture of the tiling sprite.
     * @param width - The width of the tiling sprite.
     * @param height - The height of the tiling sprite.
     */
    constructor(texture: Texture, width = 100, height = 100)
    {
        super(texture);

        this.tileTransform = new Transform();

        // The width of the tiling sprite
        this._width = width;

        // The height of the tiling sprite
        this._height = height;

        this.uvMatrix = this.texture.uvMatrix || new TextureMatrix(texture);

        /**
         * Plugin that is responsible for rendering this element.
         * Allows to customize the rendering process without overriding '_render' method.
         * @default 'tilingSprite'
         */
        this.pluginName = 'tilingSprite';

        this.uvRespectAnchor = false;
    }
    /**
     * Changes frame clamping in corresponding textureTransform, shortcut
     * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
     * @default 0.5
     * @member {number}
     */
    get clampMargin(): number
    {
        return this.uvMatrix.clampMargin;
    }

    set clampMargin(value: number)
    {
        this.uvMatrix.clampMargin = value;
        this.uvMatrix.update(true);
    }

    /** The scaling of the image that is being tiled. */
    get tileScale(): ObservablePoint
    {
        return this.tileTransform.scale;
    }

    set tileScale(value: IPointData)
    {
        this.tileTransform.scale.copyFrom(value as IPoint);
    }

    /** The offset of the image that is being tiled. */
    get tilePosition(): ObservablePoint
    {
        return this.tileTransform.position;
    }

    set tilePosition(value: ObservablePoint)
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
     * @param renderer - The renderer
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

    /** Updates the bounds of the tiling sprite. */
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
     * @param rect - Optional output rectangle.
     * @returns The bounds.
     */
    public getLocalBounds(rect?: Rectangle): Rectangle
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
     * @param point - The point to check.
     * @returns Whether or not the sprite contains the point.
     */
    public containsPoint(point: IPointData): boolean
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
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well
     */
    public destroy(options?: IDestroyOptions | boolean): void
    {
        super.destroy(options);

        this.tileTransform = null;
        this.uvMatrix = null;
    }

    /**
     * Helper function that creates a new tiling sprite based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     * @static
     * @param {string|PIXI.Texture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
     * @param {object} options - See {@link PIXI.BaseTexture}'s constructor for options.
     * @param {number} options.width - required width of the tiling sprite
     * @param {number} options.height - required height of the tiling sprite
     * @returns {PIXI.TilingSprite} The newly created texture
     */
    static from(source: TextureSource | Texture, options: ISize & IBaseTextureOptions): TilingSprite
    {
        const texture = (source instanceof Texture)
            ? source
            : Texture.from(source, options);

        return new TilingSprite(
            texture,
            options.width,
            options.height
        );
    }

    /** The width of the sprite, setting this will actually modify the scale to achieve the value set. */
    get width(): number
    {
        return this._width;
    }

    set width(value: number)
    {
        this._width = value;
    }

    /** The height of the TilingSprite, setting this will actually modify the scale to achieve the value set. */
    get height(): number
    {
        return this._height;
    }

    set height(value: number)
    {
        this._height = value;
    }
}
