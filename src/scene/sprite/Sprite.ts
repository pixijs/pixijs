import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { updateQuadBounds } from '../../utils/data/updateQuadBounds';
import { Container } from '../container/Container';

import type { PointData } from '../../maths/point/PointData';
import type { PointLike } from '../../maths/point/PointLike';
import type { TextureSourceLike } from '../../rendering/renderers/shared/texture/Texture';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { Bounds, BoundsData } from '../container/bounds/Bounds';
import type { ContainerOptions } from '../container/Container';
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
    anchor?: PointLike
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
export class Sprite extends Container implements View
{
    /**
     * Helper function that creates a new sprite based on the source you provide.
     * The source can be - frame id, image, video, canvas element, video element, texture
     * @param {TextureSourceLike} source - Source to create texture from
     * @param [skipCache] - Whether to skip the cache or not
     * @returns The newly created sprite
     */
    public static from(source: TextureSourceLike, skipCache = false): Sprite
    {
        if (source instanceof Texture)
        {
            return new Sprite(source);
        }

        return new Sprite(Texture.from(source, skipCache));
    }

    public readonly renderPipeId = 'sprite';

    public batched = true;
    public readonly _anchor: ObservablePoint;

    // sprite specific..
    /** @internal */
    public _texture: Texture;
    /** @internal */
    public _didSpriteUpdate = false;

    private readonly _bounds: BoundsData = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
    private readonly _sourceBounds: BoundsData = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
    private _boundsDirty = true;
    private _sourceBoundsDirty = true;

    public _roundPixels: 0 | 1 = 0;

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
        const { texture, anchor, roundPixels, ...rest } = options;

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
            anchor?.x ?? texture.defaultAnchor?.x ?? 0,
            anchor?.y ?? texture.defaultAnchor?.y ?? 0,
        );

        this.texture = texture;
        this.allowChildren = false;
        this.roundPixels = roundPixels ?? false;
    }

    set texture(value: Texture)
    {
        value ||= Texture.EMPTY;

        if (this._texture === value) return;

        this._texture = value;

        this.onViewUpdate();
    }

    get texture()
    {
        return this._texture;
    }

    get bounds()
    {
        if (this._boundsDirty)
        {
            this._updateBounds();
            this._boundsDirty = false;
        }

        return this._bounds;
    }

    get sourceBounds()
    {
        if (this._sourceBoundsDirty)
        {
            this._updateSourceBounds();
            this._sourceBoundsDirty = false;
        }

        return this._sourceBounds;
    }

    // passed local space..
    public containsPoint(point: PointData)
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

    public addBounds(bounds: Bounds)
    {
        const _bounds = this._texture.trim ? this.sourceBounds : this.bounds;

        bounds.addFrame(_bounds.minX, _bounds.minY, _bounds.maxX, _bounds.maxY);
    }

    /**
     * @internal
     */
    public onViewUpdate()
    {
        // increment from the 12th bit!
        this._didChangeId += 1 << 12;
        this._didSpriteUpdate = true;
        this._sourceBoundsDirty = this._boundsDirty = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        if (this.renderGroup)
        {
            this.renderGroup.onChildViewUpdate(this);
        }
    }

    private _updateBounds()
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
    public destroy(options: DestroyOptions = false)
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
    get anchor(): PointLike
    {
        return this._anchor;
    }

    set anchor(value: PointData)
    {
        this._anchor.x = value.x;
        this._anchor.y = value.y;
    }

    /** Whether or not to round the x/y position of the sprite. */
    get roundPixels()
    {
        return !!this._roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this._roundPixels = value ? 1 : 0;
    }
}
