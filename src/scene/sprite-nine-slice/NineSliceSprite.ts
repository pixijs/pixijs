import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Container } from '../container/Container';

import type { Point } from '../../maths/point/Point';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { Bounds, BoundsData } from '../container/bounds/Bounds';
import type { ContainerOptions } from '../container/Container';
import type { DestroyOptions } from '../container/destroyTypes';

/**
 * Constructor options used for `NineSliceSprite` instances.
 * ```js
 * const nineSliceSprite = new NineSliceSprite({
 *    texture: Texture.from('button.png'),
 *    leftWidth: 20,
 *    topHeight: 20,
 *    rightWidth: 20,
 *    bottomHeight: 20,
 * });
 * ```
 * @see {@link scene.NineSliceSprite}
 * @memberof scene
 */
export interface NineSliceSpriteOptions extends ContainerOptions
{
    /** The texture to use on the NineSlicePlane. */
    texture: Texture;
    /** Width of the left vertical bar (A) */
    leftWidth?: number;
    /** Height of the top horizontal bar (C) */
    topHeight?: number;
    /** Width of the right vertical bar (B) */
    rightWidth?: number;
    /** Height of the bottom horizontal bar (D) */
    bottomHeight?: number;
    /** Width of the NineSlicePlane, setting this will actually modify the vertices and not the UV's of this plane. */
    width?: number;
    /** Height of the NineSlicePlane, setting this will actually modify the vertices and not UV's of this plane. */
    height?: number;
    /** Whether or not to round the x/y position. */
    roundPixels?: boolean;
}

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+
 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 * @example
 * import { NineSlicePlane, Texture } from 'pixi.js';
 *
 * const plane9 = new NineSlicePlane(Texture.from('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 * @memberof scene
 */
export class NineSliceSprite extends Container implements View
{
    /** The default options, used to override the initial values of any options passed in the constructor. */
    public static defaultOptions: NineSliceSpriteOptions = {
        /** @default Texture.EMPTY */
        texture: Texture.EMPTY,
        /** @default 10 */
        leftWidth: 10,
        /** @default 10 */
        topHeight: 10,
        /** @default 10 */
        rightWidth: 10,
        /** @default 10 */
        bottomHeight: 10,
    };

    public _roundPixels: 0 | 1 = 0;
    public readonly renderPipeId = 'nineSliceSprite';
    public _texture: Texture;

    public batched = true;

    private _leftWidth: number;
    private _topHeight: number;
    private _rightWidth: number;
    private _bottomHeight: number;
    private _width: number;
    private _height: number;

    public _didSpriteUpdate = true;

    public bounds: BoundsData = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    /**
     * @param {scene.NineSliceSpriteOptions|Texture} options - Options to use
     * @param options.texture - The texture to use on the NineSlicePlane.
     * @param options.leftWidth - Width of the left vertical bar (A)
     * @param options.topHeight - Height of the top horizontal bar (C)
     * @param options.rightWidth - Width of the right vertical bar (B)
     * @param options.bottomHeight - Height of the bottom horizontal bar (D)
     * @param options.width - Width of the NineSlicePlane,
     * setting this will actually modify the vertices and not the UV's of this plane.
     * @param options.height - Height of the NineSlicePlane,
     * setting this will actually modify the vertices and not UV's of this plane.
     */
    constructor(options: NineSliceSpriteOptions | Texture)
    {
        if ((options instanceof Texture))
        {
            options = { texture: options };
        }

        const {
            width,
            height,
            leftWidth,
            rightWidth,
            topHeight,
            bottomHeight,
            texture,
            roundPixels,
            ...rest
        } = options;

        super({
            label: 'NineSliceSprite',
            ...rest
        });

        this._leftWidth = leftWidth;
        this._topHeight = topHeight;
        this._rightWidth = rightWidth;
        this._bottomHeight = bottomHeight;
        this.bounds.maxX = this._width = width ?? texture.width;
        this.bounds.maxY = this._height = height ?? texture.height;

        this.allowChildren = false;
        this._texture = texture;
        this.roundPixels = roundPixels ?? false;
    }

    /** The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
    get width(): number
    {
        return this._width;
    }

    set width(value: number)
    {
        this.bounds.maxX = this._width = value;
        this.onViewUpdate();
    }

    /** The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
    get height(): number
    {
        return this._height;
    }

    set height(value: number)
    {
        this.bounds.maxY = this._height = value;
        this.onViewUpdate();
    }

    /** The width of the left column (a) of the NineSlicePlane. */
    get leftWidth(): number
    {
        return this._leftWidth;
    }

    set leftWidth(value: number)
    {
        this._leftWidth = value;

        this.onViewUpdate();
    }

    /** The width of the right column (b) of the NineSlicePlane. */
    get topHeight(): number
    {
        return this._topHeight;
    }

    set topHeight(value: number)
    {
        this._topHeight = value;
        this.onViewUpdate();
    }

    /** The width of the right column (b) of the NineSlicePlane. */
    get rightWidth(): number
    {
        return this._rightWidth;
    }

    set rightWidth(value: number)
    {
        this._rightWidth = value;
        this.onViewUpdate();
    }

    /** The width of the right column (b) of the NineSlicePlane. */
    get bottomHeight(): number
    {
        return this._bottomHeight;
    }

    set bottomHeight(value: number)
    {
        this._bottomHeight = value;
        this.onViewUpdate();
    }

    /** The texture that the NineSlicePlane is using. */
    get texture(): Texture
    {
        return this._texture;
    }

    set texture(value: Texture)
    {
        if (value === this._texture) return;

        this._texture = value;

        this.onViewUpdate();
    }

    /** Whether or not to round the x/y position of the nine slice. */
    get roundPixels()
    {
        return !!this._roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this._roundPixels = value ? 1 : 0;
    }

    get textureMatrix()
    {
        return this._texture.textureMatrix.mapCoord;
    }

    get originalWidth()
    {
        return this._texture.width;
    }

    get originalHeight()
    {
        return this._texture.height;
    }

    /**
     * @internal
     */
    public onViewUpdate()
    {
        // increment from the 12th bit!
        this._didChangeId += 1 << 12;
        this._didSpriteUpdate = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        if (this.renderGroup)
        {
            this.renderGroup.onChildViewUpdate(this);
        }
    }

    public addBounds(bounds: Bounds)
    {
        const _bounds = this.bounds;

        bounds.addFrame(_bounds.minX, _bounds.minY, _bounds.maxX, _bounds.maxY);
    }

    public containsPoint(point: Point)
    {
        const bounds = this.bounds;

        if (point.x >= bounds.minX && point.x <= bounds.maxX)
        {
            if (point.y >= bounds.minY && point.y <= bounds.maxY)
            {
                return true;
            }
        }

        return false;
    }

    public destroy(options?: DestroyOptions): void
    {
        super.destroy(options);

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            this._texture.destroy(destroyTextureSource);
        }

        this._texture = null;
        (this.bounds as null) = null;
    }
}

/**
 * @deprecated since 8.0.0
 * @memberof scene
 */
export class NineSlicePlane extends NineSliceSprite
{
    constructor(options: NineSliceSpriteOptions | Texture);
    /** @deprecated since 8.0.0 */
    constructor(texture: Texture, leftWidth: number, topHeight: number, rightWidth: number, bottomHeight: number);
    constructor(...args: [NineSliceSpriteOptions | Texture] | [Texture, number, number, number, number])
    {
        let options = args[0];

        if (options instanceof Texture)
        {
            // eslint-disable-next-line max-len
            deprecation(v8_0_0, 'NineSlicePlane now uses the options object {texture, leftWidth, rightWidth, topHeight, bottomHeight}');

            options = {
                texture: options,
                leftWidth: args[1],
                topHeight: args[2],
                rightWidth: args[3],
                bottomHeight: args[4],
            };
        }

        deprecation(v8_0_0, 'NineSlicePlane is deprecated. Use NineSliceSprite instead.');
        super(options);
    }
}
