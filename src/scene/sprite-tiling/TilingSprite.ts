import { Cache } from '../../assets/cache/Cache';
import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { warn } from '../../utils/logging/warn';
import { Transform } from '../../utils/misc/Transform';
import { ViewContainer, type ViewContainerOptions } from '../view/ViewContainer';
import { type TilingSpriteGpuData } from './TilingSpritePipe';

import type { Size } from '../../maths/misc/Size';
import type { PointData } from '../../maths/point/PointData';
import type { Instruction } from '../../rendering/renderers/shared/instructions/Instruction';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { Optional } from '../container/container-mixins/measureMixin';
import type { DestroyOptions } from '../container/destroyTypes';

/**
 * Constructor options used for creating a TilingSprite instance.
 * Defines the texture, tiling behavior, and rendering properties of the sprite.
 * @example
 * ```ts
 * // Create a basic tiling sprite with repeating texture
 * const tilingSprite = new TilingSprite({
 *     texture: Texture.from('pattern.png'),
 *     width: 800,     // Width of the tiling area
 *     height: 600     // Height of the tiling area
 * });
 *
 * const background = new TilingSprite({
 *     texture: Texture.from('background.png'),
 *     width: app.screen.width,
 *     height: app.screen.height,
 *     tilePosition: { x: 0, y: 0 },
 *     tileScale: { x: 1.5, y: 1.5 }  // Scale up the texture
 *     anchor: 0.5,                    // Center anchor point
 *     roundPixels: true,              // Crisp pixel rendering
 * });
 * ```
 * @see {@link TilingSprite} For the main sprite class
 * @see {@link Texture} For texture management
 * @category scene
 * @standard
 * @noInheritDoc
 */
export interface TilingSpriteOptions extends PixiMixins.TilingSpriteOptions, ViewContainerOptions
{
    /**
     * The anchor point of the TilingSprite (0-1 range)
     *
     * Controls the origin point for rotation, scaling, and positioning.
     * Can be a number for uniform anchor or a PointData for separate x/y values.
     * @example
     * ```ts
     * // Centered anchor
     * const sprite = new TilingSprite({ ..., anchor: 0.5 });
     * sprite.anchor = 0.5;
     * // Separate x/y anchor
     * sprite.anchor = { x: 0.5, y: 0.5 };
     * // Right-aligned anchor
     * sprite.anchor = { x: 1, y: 0 };
     * // Update anchor directly
     * sprite.anchor.set(0.5, 0.5);
     * ```
     * @default 0
     */
    anchor?: PointData | number;
    /**
     * The offset of the tiling texture.
     * Used to scroll or position the repeated pattern.
     * @example
     * ```ts
     * // Offset the tiling pattern by 100 pixels in both x and y directions
     * tilingSprite.tilePosition = { x: 100, y: 100 };
     * ```
     * @default {x: 0, y: 0}
     */
    tilePosition?: PointData
    /**
     * Scale of the tiling texture.
     * Affects the size of each repeated instance of the texture.
     * @example
     * ```ts
     * // Scale the texture by 1.5 in both x and y directions
     * tilingSprite.tileScale = { x: 1.5, y: 1.5 };
     * ```
     * @default {x: 1, y: 1}
     */
    tileScale?: PointData
    /**
     * Rotation of the tiling texture in radians.
     * This controls the rotation applied to the texture before tiling.
     * @example
     * ```ts
     * // Rotate the texture by 45 degrees (in radians)
     * tilingSprite.tileRotation = Math.PI / 4; // 45 degrees
     * ```
     * @default 0
     */
    tileRotation?: number
    /**
     * The texture to use for tiling.
     * This is the image that will be repeated across the sprite.
     * @example
     * ```ts
     * // Use a texture from the asset cache
     * tilingSprite.texture = Texture.from('assets/pattern.png');
     * ```
     * @default Texture.WHITE
     */
    texture?: Texture
    /**
     * The width of the tiling area.
     * This defines how wide the tiling sprite will be.
     * @example
     * ```ts
     * // Set the width of the tiling sprite to 800 pixels
     * tilingSprite.width = 800;
     * ```
     * @default 256
     */
    width?: number
    /**
     * The height of the tiling area.
     * This defines how tall the tiling sprite will be.
     * @example
     * ```ts
     * // Set the height of the tiling sprite to 600 pixels
     * tilingSprite.height = 600;
     * ```
     * @default 256
     */
    height?: number
    /**
     * Whether the tiling pattern should originate from the anchor point.
     * When true, tiling starts from the origin instead of top-left.
     *
     * This will make the texture coordinates assigned to each vertex dependent on the value of the anchor. Without
     * this, the top-left corner always gets the (0, 0) texture coordinate.
     * @example
     * ```ts
     * // Enable anchor-based tiling
     * tilingSprite.applyAnchorToTexture = true;
     * ```
     * @default false
     */
    applyAnchorToTexture?: boolean
    /**
     * Whether to round the sprite's position to whole pixels.
     * This can help with crisp rendering, especially for pixel art.
     * When true, the sprite's position will be rounded to the nearest pixel.
     * @example
     * ```ts
     * // Enable pixel rounding for crisp rendering
     * tilingSprite.roundPixels = true;
     * ```
     * @default false
     */
    roundPixels?: boolean;
}
// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface TilingSprite extends PixiMixins.TilingSprite, ViewContainer<TilingSpriteGpuData> {}

/**
 * A TilingSprite is a fast and efficient way to render a repeating texture across a given area.
 * The texture can be scrolled, scaled, and rotated independently of the sprite itself.
 * @example
 * ```ts
 * // Create a simple tiling background
 * const background = new TilingSprite({
 *     texture: Texture.from('background.png'),
 *     width: app.screen.width,
 *     height: app.screen.height,
 * });
 * app.stage.addChild(background);
 *
 * // Create a scrolling parallax background
 * const parallax = new TilingSprite({
 *     texture: Texture.from('clouds.png'),
 *     width: app.screen.width,
 *     height: app.screen.height,
 *     tileScale: { x: 0.5, y: 0.5 }
 * });
 *
 * // Animate the tiling position
 * app.ticker.add(() => {
 *     parallax.tilePosition.x -= 1; // Scroll left
 *     parallax.tilePosition.y -= 0.5; // Scroll up slowly
 * });
 *
 * // Create a repeating pattern with rotation
 * const pattern = new TilingSprite({
 *     texture: Texture.from('pattern.png'),
 *     width: 300,
 *     height: 200,
 *     tileRotation: Math.PI / 4, // 45 degree rotation
 *     anchor: 0.5 // Center anchor point
 * });
 * ```
 * @category scene
 * @standard
 * @see {@link TilingSpriteOptions} For configuration options
 * @see {@link Texture} For texture management
 * @see {@link Assets} For asset loading
 */
export class TilingSprite extends ViewContainer<TilingSpriteGpuData> implements View, Instruction
{
    /**
     * Creates a new tiling sprite based on a source texture or image path.
     * This is a convenience method that automatically creates and manages textures.
     * @example
     * ```ts
     * // Create a new tiling sprite from an image path
     * const pattern = TilingSprite.from('pattern.png');
     * pattern.width = 300; // Set the width of the tiling area
     * pattern.height = 200; // Set the height of the tiling area
     *
     * // Create from options
     * const texture = Texture.from('pattern.png');
     * const pattern = TilingSprite.from(texture, {
     *     width: 300,
     *     height: 200,
     *     tileScale: { x: 0.5, y: 0.5 }
     * });
     * ```
     * @param source - The source to create the sprite from. Can be a path to an image or a texture
     * @param options - Additional options for the tiling sprite
     * @returns A new tiling sprite based on the source
     * @see {@link Texture.from} For texture creation details
     * @see {@link Assets} For asset loading and management
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

    /**
     * Default options used when creating a TilingSprite instance.
     * These values are used as fallbacks when specific options are not provided.
     * @example
     * ```ts
     * // Override default options globally
     * TilingSprite.defaultOptions.texture = Texture.from('defaultPattern.png');
     * TilingSprite.defaultOptions.tileScale = { x: 2, y: 2 };
     *
     * // Create sprite using default options
     * const sprite = new TilingSprite();
     * // Will use defaultPattern.png and scale 2x
     * ```
     * @type {TilingSpriteOptions}
     * @see {@link TilingSpriteOptions} For all available options
     * @see {@link TilingSprite.from} For creating sprites with custom options
     * @see {@link Texture.EMPTY} For the default empty texture
     */
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
        /**
         * Flags whether the tiling pattern should originate from the origin instead of the top-left corner in
         * local space.
         *
         * This will make the texture coordinates assigned to each vertex dependent on the value of the anchor. Without
         * this, the top-left corner always gets the (0, 0) texture coordinate.
         * @default false
         */
        applyAnchorToTexture: false,
    };

    /** @internal */
    public override readonly renderPipeId: string = 'tilingSprite';
    /** @advanced */
    public readonly batched = true;

    /**
     * Flags whether the tiling pattern should originate from the origin instead of the top-left corner in
     * local space.
     *
     * This will make the texture coordinates assigned to each vertex dependent on the value of the anchor. Without
     * this, the top-left corner always gets the (0, 0) texture coordinate.
     * @example
     * ```ts
     * // Enable anchor-based tiling
     * tilingSprite.applyAnchorToTexture = true;
     * ```
     * @default false
     */
    public applyAnchorToTexture: boolean;
    /**
     * @see {@link TilingSpriteOptions.applyAnchorToTexture}
     * @deprecated since 8.0.0
     * @advanced
     */
    public get uvRespectAnchor(): boolean
    {
        warn('uvRespectAnchor is deprecated, please use applyAnchorToTexture instead');

        return this.applyAnchorToTexture;
    }
    /** @advanced */
    public set uvRespectAnchor(value: boolean)
    {
        warn('uvRespectAnchor is deprecated, please use applyAnchorToTexture instead');
        this.applyAnchorToTexture = value;
    }

    /** @internal */
    public _anchor: ObservablePoint;
    /** @internal */
    public _tileTransform: Transform;
    /** @internal */
    public _texture: Texture;

    private _width: number;
    private _height: number;

    /**
     * @param {Texture | TilingSpriteOptions} options - The options for creating the tiling sprite.
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

        this.applyAnchorToTexture = applyAnchorToTexture;

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
     * @type {number}
     * @advanced
     */
    get clampMargin()
    {
        return this._texture.textureMatrix.clampMargin;
    }

    /** @advanced */
    set clampMargin(value: number)
    {
        this._texture.textureMatrix.clampMargin = value;
    }

    /**
     * The anchor sets the origin point of the sprite. The default value is taken from the {@link Texture}
     * and passed to the constructor.
     *
     * - The default is `(0,0)`, this means the sprite's origin is the top left.
     * - Setting the anchor to `(0.5,0.5)` means the sprite's origin is centered.
     * - Setting the anchor to `(1,1)` would mean the sprite's origin point will be the bottom right corner.
     *
     * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
     * @example
     * ```ts
     * // Center the anchor point
     * sprite.anchor = 0.5; // Sets both x and y to 0.5
     * sprite.position.set(400, 300); // Sprite will be centered at this position
     *
     * // Set specific x/y anchor points
     * sprite.anchor = {
     *     x: 1, // Right edge
     *     y: 0  // Top edge
     * };
     *
     * // Using individual coordinates
     * sprite.anchor.set(0.5, 1); // Center-bottom
     *
     * // For rotation around center
     * sprite.anchor.set(0.5);
     * sprite.rotation = Math.PI / 4; // 45 degrees around center
     *
     * // For scaling from center
     * sprite.anchor.set(0.5);
     * sprite.scale.set(2); // Scales from center point
     * ```
     */
    get anchor(): ObservablePoint
    {
        return this._anchor;
    }

    set anchor(value: PointData | number)
    {
        typeof value === 'number' ? this._anchor.set(value) : this._anchor.copyFrom(value);
    }

    /**
     * The offset of the tiling texture.
     * Used to scroll or position the repeated pattern.
     * @example
     * ```ts
     * // Offset the tiling pattern by 100 pixels in both x and y directions
     * tilingSprite.tilePosition = { x: 100, y: 100 };
     * ```
     * @default {x: 0, y: 0}
     */
    get tilePosition(): ObservablePoint
    {
        return this._tileTransform.position;
    }

    set tilePosition(value: PointData)
    {
        this._tileTransform.position.copyFrom(value);
    }

    /**
     * Scale of the tiling texture.
     * Affects the size of each repeated instance of the texture.
     * @example
     * ```ts
     * // Scale the texture by 1.5 in both x and y directions
     * tilingSprite.tileScale = { x: 1.5, y: 1.5 };
     * ```
     * @default {x: 1, y: 1}
     */
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

    /**
     * Rotation of the tiling texture in radians.
     * This controls the rotation applied to the texture before tiling.
     * @example
     * ```ts
     * // Rotate the texture by 45 degrees (in radians)
     * tilingSprite.tileRotation = Math.PI / 4; // 45 degrees
     * ```
     * @default 0
     */
    get tileRotation()
    {
        return this._tileTransform.rotation;
    }

    /**
     * The transform object that controls the tiling texture's position, scale, and rotation.
     * This transform is independent of the sprite's own transform properties.
     * @example
     * ```ts
     * // Access transform properties directly
     * sprite.tileTransform.position.set(100, 50);
     * sprite.tileTransform.scale.set(2);
     * sprite.tileTransform.rotation = Math.PI / 4;
     *
     * // Create smooth scrolling animation
     * app.ticker.add(() => {
     *     sprite.tileTransform.position.x += 1;
     *     sprite.tileTransform.rotation += 0.01;
     * });
     *
     * // Reset transform
     * sprite.tileTransform.position.set(0);
     * sprite.tileTransform.scale.set(1);
     * sprite.tileTransform.rotation = 0;
     * ```
     * @returns {Transform} The transform object for the tiling texture
     * @see {@link Transform} For transform operations
     * @see {@link TilingSprite#tilePosition} For position control
     * @see {@link TilingSprite#tileScale} For scale control
     * @see {@link TilingSprite#tileRotation} For rotation control
     * @advanced
     */
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

    /**
     * The texture to use for tiling.
     * This is the image that will be repeated across the sprite.
     * @example
     * ```ts
     * // Use a texture from the asset cache
     * tilingSprite.texture = Texture.from('assets/pattern.png');
     * ```
     * @default Texture.WHITE
     */
    get texture()
    {
        return this._texture;
    }

    /**
     * The width of the tiling area. This defines how wide the area is that the texture will be tiled across.
     * @example
     * ```ts
     * // Create a tiling sprite
     * const sprite = new TilingSprite({
     *     texture: Texture.from('pattern.png'),
     *     width: 500,
     *     height: 300
     * });
     *
     * // Adjust width dynamically
     * sprite.width = 800; // Expands tiling area
     *
     * // Update on resize
     * window.addEventListener('resize', () => {
     *     sprite.width = app.screen.width;
     * });
     * ```
     * @see {@link TilingSprite#setSize} For setting both width and height efficiently
     * @see {@link TilingSprite#height} For setting height
     */
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

    /**
     * The height of the tiling area. This defines how tall the area is that the texture will be tiled across.
     * @example
     * ```ts
     * // Create a tiling sprite
     * const sprite = new TilingSprite({
     *     texture: Texture.from('pattern.png'),
     *     width: 500,
     *     height: 300
     * });
     *
     * // Adjust width dynamically
     * sprite.height = 800; // Expands tiling area
     *
     * // Update on resize
     * window.addEventListener('resize', () => {
     *     sprite.height = app.screen.height;
     * });
     * ```
     * @see {@link TilingSprite#setSize} For setting both width and height efficiently
     * @see {@link TilingSprite#width} For setting width
     */
    override get height()
    {
        return this._height;
    }

    /**
     * Sets the size of the TilingSprite to the specified width and height.
     * This is faster than setting width and height separately as it only triggers one update.
     * @example
     * ```ts
     * // Set specific dimensions
     * sprite.setSize(300, 200); // Width: 300, Height: 200
     *
     * // Set uniform size (square)
     * sprite.setSize(400); // Width: 400, Height: 400
     *
     * // Set size using object
     * sprite.setSize({
     *     width: 500,
     *     height: 300
     * });
     * ```
     * @param value - This can be either a number for uniform sizing or a Size object with width/height properties
     * @param height - The height to set. Defaults to the value of `width` if not provided
     * @see {@link TilingSprite#width} For setting width only
     * @see {@link TilingSprite#height} For setting height only
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
     * Retrieves the size of the TilingSprite as a {@link Size} object.
     * This method is more efficient than getting width and height separately as it only allocates one object.
     * @example
     * ```ts
     * // Get basic size
     * const size = sprite.getSize();
     * console.log(`Size: ${size.width}x${size.height}`);
     *
     * // Reuse existing size object
     * const reuseSize = { width: 0, height: 0 };
     * sprite.getSize(reuseSize);
     * ```
     * @param out - Optional object to store the size in, to avoid allocating a new object
     * @returns The size of the TilingSprite
     * @see {@link TilingSprite#width} For getting just the width
     * @see {@link TilingSprite#height} For getting just the height
     * @see {@link TilingSprite#setSize} For setting both width and height efficiently
     */
    public override getSize(out?: Size): Size
    {
        out ||= {} as Size;
        out.width = this._width;
        out.height = this._height;

        return out;
    }

    /** @private */
    protected override updateBounds()
    {
        const bounds = this._bounds;

        const anchor = this._anchor;

        const width = this._width;
        const height = this._height;

        bounds.minX = -anchor._x * width;
        bounds.maxX = bounds.minX + width;

        bounds.minY = -anchor._y * height;
        bounds.maxY = bounds.minY + height;
    }

    /**
     * Checks if the object contains the given point in local coordinates.
     * Takes into account the anchor offset when determining boundaries.
     * @example
     * ```ts
     * // Create a tiling sprite
     * const sprite = new TilingSprite({
     *     texture: Texture.from('pattern.png'),
     *     width: 200,
     *     height: 100,
     *     anchor: 0.5 // Center anchor
     * });
     *
     * // Basic point check
     * const contains = sprite.containsPoint({ x: 50, y: 25 });
     * console.log('Point is inside:', contains);
     *
     * // Check with different anchors
     * sprite.anchor.set(0); // Top-left anchor
     * console.log('Contains point:', sprite.containsPoint({ x: 150, y: 75 }));
     * ```
     * @param point - The point to check in local coordinates
     * @returns True if the point is within the sprite's bounds
     * @see {@link TilingSprite#toLocal} For converting global coordinates to local
     * @see {@link TilingSprite#anchor} For understanding boundary calculations
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

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @example
     * tilingSprite.destroy();
     * tilingSprite.destroy(true);
     * tilingSprite.destroy({ texture: true, textureSource: true });
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

