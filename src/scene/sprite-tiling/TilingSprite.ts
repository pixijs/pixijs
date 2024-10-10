import { Cache } from '../../assets/cache/Cache';
import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Transform } from '../../utils/misc/Transform';
import { ViewContainer } from '../view/View';

import type { Size } from '../../maths/misc/Size';
import type { PointData } from '../../maths/point/PointData';
import type { Instruction } from '../../rendering/renderers/shared/instructions/Instruction';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { ContainerOptions } from '../container/Container';
import type { Optional } from '../container/container-mixins/measureMixin';
import type { DestroyOptions } from '../container/destroyTypes';

/**
 * Constructor options used for `TilingSprite` instances. Extends {@link scene.TilingSpriteViewOptions}
 * ```js
 * const tilingSprite = new TilingSprite({
 *    texture: Texture.from('assets/image.png'),
 *    width: 100,
 *    height: 100,
 *    tilePosition: { x: 100, y: 100 },
 *    tileScale: { x: 2, y: 2 },
 * });
 * ```
 * @see {@link scene.TilingSprite}
 * @see {@link scene.TilingSpriteViewOptions}
 * @memberof scene
 */
export interface TilingSpriteOptions extends ContainerOptions
{
    /**
     * The anchor point of the sprite
     * @default {x: 0, y: 0}
     */
    anchor?: PointData
    /**
     * The offset of the image that is being tiled.
     * @default {x: 0, y: 0}
     */
    tilePosition?: PointData
    /**
     * Scaling of the image that is being tiled.
     * @default {x: 1, y: 1}
     */
    tileScale?: PointData
    /**
     * The rotation of the image that is being tiled.
     * @default 0
     */
    tileRotation?: number
    /**
     * The texture to use for the sprite.
     * @default Texture.WHITE
     */
    texture?: Texture
    /**
     * The width of the tiling sprite. #
     * @default 256
     */
    width?: number
    /**
     * The height of the tiling sprite.
     * @default 256
     */
    height?: number
    // TODO needs a better name..
    /**
     * @todo
     * @default false
     */
    applyAnchorToTexture?: boolean
    /** Whether or not to round the x/y position. */
    roundPixels?: boolean;
}

/**
 * A tiling sprite is a fast way of rendering a tiling image.
 * @example
 * const tilingSprite = new TilingSprite({
 *    texture: Texture.from('assets/image.png'),
 *    width: 100,
 *    height: 100,
 * });
 *
 * tilingSprite.tilePosition.x = 100;
 * tilingSprite.tilePosition.y = 100;
 *
 * app.stage.addChild(tilingSprite);
 * @memberof scene
 * @extends scene.Container
 */
export class TilingSprite extends ViewContainer implements View, Instruction
{
    /**
     * Creates a new tiling sprite.
     * @param source - The source to create the texture from.
     * @param options - The options for creating the tiling sprite.
     * @returns A new tiling sprite.
     */
    public static from(source: Texture | string, options: TilingSpriteOptions = {})
    {
        if (typeof source === 'string')
        {
            return new TilingSprite({
                texture: Cache.get(source),
                ...options,
            });
        }

        return new TilingSprite({
            texture: source,
            ...options,
        });
    }

    /** default options for the TilingSprite */
    public static defaultOptions: TilingSpriteOptions = {
        /** The texture to use for the sprite. */
        texture: Texture.EMPTY,
        /** The anchor point of the sprite */
        anchor: { x: 0, y: 0 },
        /** The offset of the image that is being tiled. */
        tilePosition: { x: 0, y: 0 },
        /** Scaling of the image that is being tiled. */
        tileScale: { x: 1, y: 1 },
        /** The rotation of the image that is being tiled. */
        tileRotation: 0,
        /** TODO */
        applyAnchorToTexture: false,
    };

    public override readonly renderPipeId: string = 'tilingSprite';
    public readonly batched = true;

    public _anchor: ObservablePoint;

    public _tileTransform: Transform;
    public _texture: Texture;
    public _applyAnchorToTexture: boolean;
    public _didTilingSpriteUpdate: boolean;

    private _width: number;
    private _height: number;

    /**
     * @param {rendering.Texture | scene.TilingSpriteOptions} options - The options for creating the tiling sprite.
     */
    constructor(options?: Texture | TilingSpriteOptions);
    /** @deprecated since 8.0.0 */
    constructor(texture: Texture, width: number, height: number);
    constructor(...args: [(Texture | TilingSpriteOptions)?] | [Texture, number, number])
    {
        let options = args[0] || {};

        if (options instanceof Texture)
        {
            options = { texture: options };
        }

        if (args.length > 1)
        {
            // #if _DEBUG
            deprecation(v8_0_0, 'use new TilingSprite({ texture, width:100, height:100 }) instead');
            // #endif

            options.width = args[1];
            options.height = args[2];
        }

        options = { ...TilingSprite.defaultOptions, ...options };

        const {
            texture,
            anchor,
            tilePosition,
            tileScale,
            tileRotation,
            width,
            height,
            applyAnchorToTexture,
            roundPixels,
            ...rest
        } = options ?? {};

        super({

            label: 'TilingSprite',
            ...rest
        });

        this.allowChildren = false;

        this._anchor = new ObservablePoint(
            {
                _onUpdate: () =>
                {
                    this.onViewUpdate();
                }
            },
        );

        this._applyAnchorToTexture = applyAnchorToTexture;

        this.texture = texture;
        this._width = width ?? texture.width;
        this._height = height ?? texture.height;

        this._tileTransform = new Transform({
            observer: {
                _onUpdate: () => this.onViewUpdate(),
            }
        });

        if (anchor) this.anchor = anchor;
        this.tilePosition = tilePosition;
        this.tileScale = tileScale;
        this.tileRotation = tileRotation;

        this.roundPixels = roundPixels ?? false;
    }

    /**
     * Changes frame clamping in corresponding textureMatrix
     * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
     * @default 0.5
     * @member {number}
     */
    get clampMargin()
    {
        return this._texture.textureMatrix.clampMargin;
    }

    set clampMargin(value: number)
    {
        this._texture.textureMatrix.clampMargin = value;
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
     * import { TilingSprite } from 'pixi.js';
     *
     * const sprite = new TilingSprite({texture: Texture.WHITE});
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

    /** The offset of the image that is being tiled. */
    get tilePosition(): ObservablePoint
    {
        return this._tileTransform.position;
    }

    set tilePosition(value: PointData)
    {
        this._tileTransform.position.copyFrom(value);
    }

    /** The scaling of the image that is being tiled. */
    get tileScale(): ObservablePoint
    {
        return this._tileTransform.scale;
    }

    set tileScale(value: PointData | number)
    {
        typeof value === 'number' ? this._tileTransform.scale.set(value) : this._tileTransform.scale.copyFrom(value);
    }

    set tileRotation(value)
    {
        this._tileTransform.rotation = value;
    }

    /** The rotation of the image that is being tiled. */
    get tileRotation()
    {
        return this._tileTransform.rotation;
    }

    /** The transform of the image that is being tiled. */
    get tileTransform()
    {
        return this._tileTransform;
    }

    set texture(value: Texture)
    {
        value ||= Texture.EMPTY;

        const currentTexture = this._texture;

        if (currentTexture === value) return;

        if (currentTexture && currentTexture.dynamic) currentTexture.off('update', this.onViewUpdate, this);
        if (value.dynamic) value.on('update', this.onViewUpdate, this);

        this._texture = value;

        this.onViewUpdate();
    }

    /** The texture that the sprite is using. */
    get texture()
    {
        return this._texture;
    }

    /** The width of the tiling area. */
    override set width(value: number)
    {
        this._width = value;
        this.onViewUpdate();
    }

    override get width()
    {
        return this._width;
    }

    override set height(value: number)
    {
        this._height = value;
        this.onViewUpdate();
    }

    /** The height of the tiling area. */
    override get height()
    {
        return this._height;
    }

    /**
     * Sets the size of the TilingSprite to the specified width and height.
     * This is faster than setting the width and height separately.
     * @param value - This can be either a number or a [Size]{@link Size} object.
     * @param height - The height to set. Defaults to the value of `width` if not provided.
     */
    public override setSize(value: number | Optional<Size, 'height'>, height?: number): void
    {
        if (typeof value === 'object')
        {
            height = value.height ?? value.width;
            value = value.width;
        }

        this._width = value;
        this._height = height ?? value;

        this.onViewUpdate();
    }

    /**
     * Retrieves the size of the TilingSprite as a [Size]{@link Size} object.
     * This is faster than get the width and height separately.
     * @param out - Optional object to store the size in.
     * @returns - The size of the TilingSprite.
     */
    public override getSize(out?: Size): Size
    {
        out ||= {} as Size;
        out.width = this._width;
        out.height = this._height;

        return out;
    }

    /**
     * @private
     */
    protected override updateBounds()
    {
        const bounds = this._bounds;

        const anchor = this._anchor;

        const width = this._width;
        const height = this._height;

        bounds.maxX = -anchor._x * width;
        bounds.minX = bounds.maxX + width;

        bounds.maxY = -anchor._y * height;
        bounds.minY = bounds.maxY + height;
    }

    /**
     * Checks if the object contains the given point.
     * @param point - The point to check
     */
    public override containsPoint(point: PointData)
    {
        const width = this._width;
        const height = this._height;
        const x1 = -width * this._anchor._x;
        let y1 = 0;

        if (point.x >= x1 && point.x <= x1 + width)
        {
            y1 = -height * this._anchor._y;

            if (point.y >= y1 && point.y <= y1 + height) return true;
        }

        return false;
    }

    public onViewUpdate()
    {
        this._boundsDirty = true;
        this._didTilingSpriteUpdate = true;

        this._didViewChangeTick++;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.onChildViewUpdate(this);
        }
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

        this._anchor = null;
        this._tileTransform = null;
        this._bounds = null;

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            this._texture.destroy(destroyTextureSource);
        }

        this._texture = null;
    }
}

