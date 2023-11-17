import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { Container } from '../container/Container';
import { SpriteView } from './SpriteView';

import type { PointData } from '../../maths/point/PointData';
import type { PointLike } from '../../maths/point/PointLike';
import type { TextureSourceLike } from '../../rendering/renderers/shared/texture/Texture';
import type { ContainerOptions } from '../container/Container';

/**
 * Options for the {@link scene.Sprite} constructor.
 * @memberof scene
 */
export interface SpriteOptions extends Partial<ContainerOptions<SpriteView>>
{
    /** The texture to use for the sprite. */
    texture?: Texture;
    /** The anchor point of the sprite. */
    anchor?: PointLike
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
export class Sprite extends Container<SpriteView>
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

    /**
     * @param options - The options for creating the sprite.
     */
    constructor(options: SpriteOptions | Texture = Texture.EMPTY)
    {
        if (options instanceof Texture)
        {
            options = { texture: options };
        }

        const { texture, ...rest } = options;

        super({
            view: new SpriteView(texture ?? Texture.EMPTY),
            label: 'Sprite',
            ...rest
        });

        this.allowChildren = false;
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
        return this.view.anchor;
    }

    set anchor(value: PointData)
    {
        this.view.anchor.x = value.x;
        this.view.anchor.y = value.y;
    }

    /** The texture that the sprite is using. */
    get texture()
    {
        return this.view.texture;
    }

    set texture(value: Texture)
    {
        this.view.texture = value;
    }

    /** Whether or not to round the x/y position of the sprite. */
    get roundPixels()
    {
        return !!this.view.roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this.view.roundPixels = value ? 1 : 0;
    }
}

