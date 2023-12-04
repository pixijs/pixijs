import { Cache } from '../../assets/cache/Cache';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Container } from '../container/Container';
import { definedProps } from '../container/utils/definedProps';
import { TilingSpriteView } from './TilingSpriteView';

import type { PointData } from '../../maths/point/PointData';
import type { PointLike } from '../../maths/point/PointLike';
import type { ContainerOptions } from '../container/Container';
import type { TilingSpriteViewOptions } from './TilingSpriteView';

/**
 * Options for the {@link scene.TilingSprite} constructor.
 * @memberof scene
 */
export interface TilingSpriteOptions extends TilingSpriteViewOptions, Partial<ContainerOptions<TilingSpriteView>>
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
export class TilingSprite extends Container<TilingSpriteView>
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

    /**
     * @param options - The options for creating the tiling sprite.
     */
    constructor(options?: Texture | TilingSpriteOptions);
    /** @deprecated since 8.0.0 */
    constructor(texture: Texture, width: number, height: number);
    constructor(...args: [(Texture | TilingSpriteViewOptions)?] | [Texture, number, number])
    {
        let options = args[0] || {};

        if (options instanceof Texture)
        {
            options = { texture: options };
        }

        if (args.length > 1)
        {
            deprecation(v8_0_0, 'use new TilingSprite({ texture, width:100, height:100 }) instead');

            options.width = args[1];
            options.height = args[2];
        }

        if (options instanceof Texture)
        {
            options = { texture: options };
        }

        const { texture, width, height, applyAnchorToTexture, ...rest } = options ?? {};

        super({
            view: new TilingSpriteView(definedProps({
                texture,
                width,
                height,
                applyAnchorToTexture,
            })),
            label: 'TilingSprite',
            ...rest
        });

        this.allowChildren = false;
    }

    /**
     * Changes frame clamping in corresponding textureMatrix
     * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
     * @default 0.5
     * @member {number}
     */
    get clampMargin()
    {
        return this.view.texture.textureMatrix.clampMargin;
    }

    set clampMargin(value: number)
    {
        this.view.texture.textureMatrix.clampMargin = value;
    }

    set texture(value)
    {
        this.view.texture = value;
    }

    /** The texture that the sprite is using. */
    get texture()
    {
        return this.view.texture;
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
    get anchor(): PointLike
    {
        return this.view.anchor;
    }

    set anchor(value: PointData)
    {
        this.view.anchor.x = value.x;
        this.view.anchor.y = value.y;
    }

    /** The width of the tiling area. */
    get width(): number
    {
        return this.view.width;
    }

    set width(value: number)
    {
        this.view.width = value;
    }

    /** The height of the tiling area. */
    get height(): number
    {
        return this.view.height;
    }

    set height(value: number)
    {
        this.view.height = value;
    }

    /** The offset of the image that is being tiled. */
    get tilePosition()
    {
        return this.view._tileTransform.position;
    }

    set tilePosition(value: PointData)
    {
        this.view._tileTransform.position.copyFrom(value);
    }

    /** The scaling of the image that is being tiled. */
    get tileScale()
    {
        return this.view._tileTransform.scale;
    }

    set tileScale(value: PointData)
    {
        this.view._tileTransform.scale.copyFrom(value);
    }

    set tileRotation(value)
    {
        this.view._tileTransform.rotation = value;
    }

    /** The rotation of the image that is being tiled. */
    get tileRotation()
    {
        return this.view._tileTransform.rotation;
    }

    /** The transform of the image that is being tiled. */
    get tileTransform()
    {
        return this.view._tileTransform;
    }

    /** Whether or not to round the x/y position of the tiling sprite. */
    get roundPixels()
    {
        return !!this.view.roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this.view.roundPixels = value ? 1 : 0;
    }
}

