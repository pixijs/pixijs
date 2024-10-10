import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { updateQuadBounds } from '../../utils/data/updateQuadBounds';
import { ViewContainer } from '../view/View';

import type { Size } from '../../maths/misc/Size';
import type { PointData } from '../../maths/point/PointData';
import type { TextureSourceLike } from '../../rendering/renderers/shared/texture/Texture';
import type { BoundsData } from '../container/bounds/Bounds';
import type { ContainerOptions } from '../container/Container';
import type { Optional } from '../container/container-mixins/measureMixin';
import type { DestroyOptions } from '../container/destroyTypes';

/**
 * Options for the {@link scene.Sprite} constructor.
 * @memberof scene
 */
export interface SpriteOptions extends ContainerOptions
{
    /** The texture to use for the sprite. */
    texture?: Texture;
    /** The anchor point of the sprite. */
    anchor?: PointData | number;
    /** Whether or not to round the x/y position. */
    roundPixels?: boolean;
}

/**
 * The Sprite object is one of the most important objects in PixiJS. It is a
 * drawing item that can be added to a scene and rendered to the screen.
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * import { Sprite } from 'pixi.js';
 *
 * const sprite = Sprite.from('assets/image.png');
 * ```
 *
 * The more efficient way to create sprites is using a {@link assets.Spritesheet},
 * as swapping base textures when rendering to the screen is inefficient.
 *
 * ```js
 * import { Assets, Sprite } from 'pixi.js';
 *
 * const sheet = await Assets.load('assets/spritesheet.json');
 * const sprite = new Sprite(sheet.textures['image.png']);
 * ```
 * @memberof scene
 * @extends scene.Container
 */
export class Sprite extends ViewContainer
{
    /**
     * Helper function that creates a new sprite based on the source you provide.
     * The source can be - frame id, image, video, canvas element, video element, texture
     * @param source - Source to create texture from
     * @param [skipCache] - Whether to skip the cache or not
     * @returns The newly created sprite
     */
    public static from(source: Texture | TextureSourceLike, skipCache = false): Sprite
    {
        if (source instanceof Texture)
        {
            return new Sprite(source);
        }

        return new Sprite(Texture.from(source, skipCache));
    }

    public override readonly renderPipeId: string = 'sprite';

    public batched = true;
    public readonly _anchor: ObservablePoint;

    // sprite specific..
    public _texture: Texture;
    public _didSpriteUpdate = false;

    private readonly _sourceBounds: BoundsData = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
    private _sourceBoundsDirty = true;

    private _width: number;
    private _height: number;

    /**
     * @param options - The options for creating the sprite.
     */
    constructor(options: SpriteOptions | Texture = Texture.EMPTY)
    {
        if (options instanceof Texture)
        {
            options = { texture: options };
        }

        // split out
        const { texture = Texture.EMPTY, anchor, roundPixels, width, height, ...rest } = options;

        super({
            label: 'Sprite',
            ...rest
        });

        this._anchor = new ObservablePoint(
            {
                _onUpdate: () =>
                {
                    this.onViewUpdate();
                }
            },
        );

        if (anchor)
        {
            this.anchor = anchor;
        }
        else if (texture.defaultAnchor)
        {
            this.anchor = texture.defaultAnchor;
        }

        this.texture = texture;

        this.allowChildren = false;
        this.roundPixels = roundPixels ?? false;

        // needs to be set after the container has initiated
        if (width !== undefined) this.width = width;
        if (height !== undefined) this.height = height;
    }

    set texture(value: Texture)
    {
        value ||= Texture.EMPTY;

        const currentTexture = this._texture;

        if (currentTexture === value) return;

        if (currentTexture && currentTexture.dynamic) currentTexture.off('update', this.onViewUpdate, this);
        if (value.dynamic) value.on('update', this.onViewUpdate, this);

        this._texture = value;

        if (this._width)
        {
            this._setWidth(this._width, this._texture.orig.width);
        }

        if (this._height)
        {
            this._setHeight(this._height, this._texture.orig.height);
        }

        this.onViewUpdate();
    }

    /** The texture that the sprite is using. */
    get texture()
    {
        return this._texture;
    }

    /**
     * The bounds of the sprite, taking the texture's trim into account.
     * @type {rendering.Bounds}
     */
    get sourceBounds()
    {
        if (this._sourceBoundsDirty)
        {
            this._updateSourceBounds();
            this._sourceBoundsDirty = false;
        }

        return this._sourceBounds;
    }

    /**
     * Checks if the object contains the given point.
     * @param point - The point to check
     */
    public override containsPoint(point: PointData)
    {
        const bounds = this.sourceBounds;

        if (point.x >= bounds.maxX && point.x <= bounds.minX)
        {
            if (point.y >= bounds.maxY && point.y <= bounds.minY)
            {
                return true;
            }
        }

        return false;
    }

    public override onViewUpdate()
    {
        this._didViewChangeTick++;

        this._didSpriteUpdate = true;
        this._sourceBoundsDirty = this._boundsDirty = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.onChildViewUpdate(this);
        }
    }

    /** @private */
    protected updateBounds()
    {
        updateQuadBounds(this._bounds, this._anchor, this._texture, 0);
    }

    private _updateSourceBounds()
    {
        const anchor = this._anchor;
        const texture = this._texture;

        const sourceBounds = this._sourceBounds;

        const { width, height } = texture.orig;

        sourceBounds.maxX = -anchor._x * width;
        sourceBounds.minX = sourceBounds.maxX + width;

        sourceBounds.maxY = -anchor._y * height;
        sourceBounds.minY = sourceBounds.maxY + height;
    }

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
     */
    public override destroy(options: DestroyOptions = false)
    {
        super.destroy(options);

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            this._texture.destroy(destroyTextureSource);
        }

        this._texture = null;
        (this._bounds as null) = null;
        (this._sourceBounds as null) = null;
        (this._anchor as null) = null;
    }

    /**
     * The anchor sets the origin point of the sprite. The default value is taken from the {@link Texture}
     * and passed to the constructor.
     *
     * The default is `(0,0)`, this means the sprite's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the sprite's origin is centered.
     *
     * Setting the anchor to `(1,1)` would mean the sprite's origin point will be the bottom right corner.
     *
     * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
     * @example
     * import { Sprite } from 'pixi.js';
     *
     * const sprite = new Sprite({texture: Texture.WHITE});
     * sprite.anchor.set(0.5); // This will set the origin to center. (0.5) is same as (0.5, 0.5).
     */
    get anchor(): ObservablePoint
    {
        return this._anchor;
    }

    set anchor(value: PointData | number)
    {
        typeof value === 'number' ? this._anchor.set(value) : this._anchor.copyFrom(value);
    }

    /** The width of the sprite, setting this will actually modify the scale to achieve the value set. */
    override get width(): number
    {
        return Math.abs(this.scale.x) * this._texture.orig.width;
    }

    override set width(value: number)
    {
        this._setWidth(value, this._texture.orig.width);
        this._width = value;
    }

    /** The height of the sprite, setting this will actually modify the scale to achieve the value set. */
    override get height(): number
    {
        return Math.abs(this.scale.y) * this._texture.orig.height;
    }

    override set height(value: number)
    {
        this._setHeight(value, this._texture.orig.height);
        this._height = value;
    }

    /**
     * Retrieves the size of the Sprite as a [Size]{@link Size} object.
     * This is faster than get the width and height separately.
     * @param out - Optional object to store the size in.
     * @returns - The size of the Sprite.
     */
    public override getSize(out?: Size): Size
    {
        out ||= {} as Size;
        out.width = Math.abs(this.scale.x) * this._texture.orig.width;
        out.height = Math.abs(this.scale.y) * this._texture.orig.height;

        return out;
    }

    /**
     * Sets the size of the Sprite to the specified width and height.
     * This is faster than setting the width and height separately.
     * @param value - This can be either a number or a [Size]{@link Size} object.
     * @param height - The height to set. Defaults to the value of `width` if not provided.
     */
    public override setSize(value: number | Optional<Size, 'height'>, height?: number)
    {
        if (typeof value === 'object')
        {
            height = value.height ?? value.width;
            value = value.width;
        }
        else
        {
            height ??= value;
        }

        value !== undefined && this._setWidth(value, this._texture.orig.width);
        height !== undefined && this._setHeight(height, this._texture.orig.height);
    }
}
