import EventEmitter from 'eventemitter3';
import { Cache } from '../../../../assets/cache/Cache';
import { DOMAdapter } from '../../../../environment/adapter';
import { groupD8 } from '../../../../maths/matrix/groupD8';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { uid } from '../../../../utils/data/uid';
import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';
import { NOOP } from '../../../../utils/misc/NOOP';
import { ImageSource } from './sources/ImageSource';
import { resourceToTexture } from './sources/resourceToTexture';
import { TextureSource } from './sources/TextureSource';
import { TextureMatrix } from './TextureMatrix';

import type { BufferSourceOptions } from './sources/BufferSource';
import type { TextureSourceOptions } from './sources/TextureSource';

/** Stores the width of the non-scalable borders, for example when used with {@link scene.NineSlicePlane} texture. */
export interface TextureBorders
{
    /** left border in pixels */
    left: number;
    /** top border in pixels */
    top: number;
    /** right border in pixels */
    right: number;
    /** bottom border in pixels */
    bottom: number;
}

export type UVs = {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
};

/** the options that can be passed to a new Texture */
export interface TextureOptions
{
    /** the underlying texture data that this texture will use  */
    source?: TextureSource;
    /** optional label, for debugging */
    label?: string;
    /** The rectangle frame of the texture to show */
    frame?: Rectangle;
    /** The area of original texture */
    orig?: Rectangle;
    /** Trimmed rectangle of original texture */
    trim?: Rectangle;
    /** Default anchor point used for sprite placement / rotation */
    defaultAnchor?: { x: number; y: number };
    /** Default borders used for 9-slice scaling {@link NineSlicePlane}*/
    defaultBorders?: TextureBorders;
    /** indicates how the texture was rotated by texture packer. See {@link groupD8} */
    rotate?: number;
}

export interface BindableTexture
{
    source: TextureSource;
}

export type TextureSourceLike = TextureSource | TextureSourceOptions | BufferSourceOptions | string;

/**
 * A texture stores the information that represents an image or part of an image.
 *
 * A texture must have a loaded resource passed to it to work. It does not contain any
 * loading mechanisms.
 *
 * The Assets class can be used to load an texture from a file. This is the recommended
 * way as it will handle the loading and caching for you.
 *
 * ```js
 *
 * const texture = await Asset.load('assets/image.png');
 *
 * // once Assets has loaded the image it will be available via the from method
 * const sameTexture = Texture.from('assets/image.png');
 * // another way to acces the texture once loaded
 * const sameAgainTexture = Asset.get('assets/image.png');
 *
 * const sprite1 = new Sprite(texture);
 *
 * ```
 *
 * It cannot be added to the display list directly; instead use it as the texture for a Sprite.
 * If no frame is provided for a texture, then the whole image is used.
 *
 * You can directly create a texture from an image and then reuse it multiple times like this :
 *
 * ```js
 * import { Sprite, Texture } from 'pixi.js';
 *
 * const texture = await Asset.load('assets/image.png');
 * const sprite1 = new Sprite(texture);
 * const sprite2 = new Sprite(texture);
 * ```
 *
 * If you didn't pass the texture frame to constructor, it enables `noFrame` mode:
 * it subscribes on baseTexture events, it automatically resizes at the same time as baseTexture.
 * @namespace core
 * @class
 */
export class Texture extends EventEmitter<{
    update: Texture
    destroy: Texture
}> implements BindableTexture
{
    /**
     * Helper function that creates a returns Texture based on the source you provide.
     * The source should be loaded and ready to go. If not its best to grab the asset using Assets.
     * @param id - String or Source to create texture from
     * @param skipCache - Skip adding the texture to the cache
     * @returns The texture based on the Id provided
     */
    public static from(id: TextureSourceLike, skipCache = false): Texture
    {
        if (typeof id === 'string')
        {
            return Cache.get(id);
        }
        else if (id instanceof TextureSource)
        {
            return new Texture({ source: id });
        }

        // return a auto generated texture from resource
        return resourceToTexture(id, skipCache);
    }

    /** label used for debugging */
    public label?: string;
    /** unique id for this texture */
    public uid = uid('texture');
    /**
     * Has the texture been destroyed?
     * @readonly
     */
    public destroyed: boolean;

    /** @internal */
    public _source: TextureSource;

    /**
     * Indicates whether the texture is rotated inside the atlas
     * set to 2 to compensate for texture packer rotation
     * set to 6 to compensate for spine packer rotation
     * can be used to rotate or mirror sprites
     * See {@link PIXI.groupD8} for explanation
     */
    public readonly rotate: number;
    /** A uvs object based on the given frame and the texture source */
    public readonly uvs: UVs = { x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
    /**
     * Anchor point that is used as default if sprite is created with this texture.
     * Changing the `defaultAnchor` at a later point of time will not update Sprite's anchor point.
     * @default {0,0}
     */
    public readonly defaultAnchor?: { x: number; y: number };
    /**
     * Default width of the non-scalable border that is used if 9-slice plane is created with this texture.
     * @since 7.2.0
     * @see PIXI.NineSlicePlane
     */
    public readonly defaultBorders?: TextureBorders;
    /**
     * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
     * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
     */
    public readonly frame = new Rectangle();
    /** This is the area of original texture, before it was put in atlas. */
    public readonly orig: Rectangle;
    /**
     * This is the trimmed area of original texture, before it was put in atlas
     * Please call `updateUvs()` after you change coordinates of `trim` manually.
     */
    public readonly trim: Rectangle;

    /**
     * Does this Texture have any frame data assigned to it?
     *
     * This mode is enabled automatically if no frame was passed inside constructor.
     *
     * In this mode texture is subscribed to baseTexture events, and fires `update` on any change.
     *
     * Beware, after loading or resize of baseTexture event can fired two times!
     * If you want more control, subscribe on baseTexture itself.
     * @example
     * texture.on('update', () => {});
     */
    public noFrame = false;

    private _textureMatrix: TextureMatrix;

    constructor({
        source,
        label,
        frame,
        orig,
        trim,
        defaultAnchor,
        defaultBorders,
        rotate
    }: TextureOptions = {})
    {
        super();

        this.label = label;
        this.source = source?.source ?? new TextureSource();

        this.noFrame = !frame;

        if (frame)
        {
            this.frame.copyFrom(frame);
        }
        else
        {
            const { width, height } = this._source;

            this.frame.width = width;
            this.frame.height = height;
        }

        this.orig = orig || this.frame;
        this.trim = trim;

        this.rotate = rotate ?? 0;
        this.defaultAnchor = defaultAnchor;
        this.defaultBorders = defaultBorders;

        this.destroyed = false;

        this.updateUvs();
    }

    set source(value: TextureSource)
    {
        if (this._source)
        {
            this._source.off('resize', this.onUpdate, this);
        }

        this._source = value;

        value.on('resize', this.onUpdate, this);

        this.emit('update', this);
    }

    /** the underlying source of the texture (equivalent of baseTexture in v7) */
    get source(): TextureSource
    {
        return this._source;
    }

    /** returns a TextureMatrix instance for this texture. By default, that object is not created because its heavy. */
    get textureMatrix()
    {
        if (!this._textureMatrix)
        {
            this._textureMatrix = new TextureMatrix(this);
        }

        return this._textureMatrix;
    }

    /** The width of the Texture in pixels. */
    get width(): number
    {
        return this.orig.width;
    }

    /** The height of the Texture in pixels. */
    get height(): number
    {
        return this.orig.height;
    }

    /** Call this function when you have modified the frame of this texture. */
    public updateUvs()
    {
        const { uvs, frame } = this;
        const { width, height } = this._source;

        const nX = frame.x / width;
        const nY = frame.y / height;

        const nW = frame.width / width;
        const nH = frame.height / height;

        let rotate = this.rotate;

        if (rotate)
        {
            // width and height div 2 div baseFrame size
            const w2 = nW / 2;
            const h2 = nH / 2;

            // coordinates of center
            const cX = nX + w2;
            const cY = nY + h2;

            rotate = groupD8.add(rotate, groupD8.NW); // NW is top-left corner
            uvs.x0 = cX + (w2 * groupD8.uX(rotate));
            uvs.y0 = cY + (h2 * groupD8.uY(rotate));

            rotate = groupD8.add(rotate, 2); // rotate 90 degrees clockwise
            uvs.x1 = cX + (w2 * groupD8.uX(rotate));
            uvs.y1 = cY + (h2 * groupD8.uY(rotate));

            rotate = groupD8.add(rotate, 2);
            uvs.x2 = cX + (w2 * groupD8.uX(rotate));
            uvs.y2 = cY + (h2 * groupD8.uY(rotate));

            rotate = groupD8.add(rotate, 2);
            uvs.x3 = cX + (w2 * groupD8.uX(rotate));
            uvs.y3 = cY + (h2 * groupD8.uY(rotate));
        }

        else
        {
            uvs.x0 = nX;
            uvs.y0 = nY;
            uvs.x1 = nX + nW;
            uvs.y1 = nY;
            uvs.x2 = nX + nW;
            uvs.y2 = nY + nH;
            uvs.x3 = nX;
            uvs.y3 = nY + nH;
        }
    }

    /**
     * Destroys this texture
     * @param destroySource - Destroy the source when the texture is destroyed.
     */
    public destroy(destroySource = false)
    {
        if (this._source)
        {
            if (destroySource)
            {
                this._source.destroy();
                this._source = null;
            }
        }

        this._textureMatrix = null;
        this.destroyed = true;
        this.emit('destroy', this);
        this.removeAllListeners();
    }

    /**
     * @internal
     */
    protected onUpdate()
    {
        if (this.noFrame)
        {
            this.frame.width = this._source.width;
            this.frame.height = this._source.height;
        }

        this.updateUvs();
        this.emit('update', this);
    }

    /** @deprecated since 8.0.0 */
    get baseTexture(): TextureSource
    {
        deprecation(v8_0_0, 'Texture.baseTexture is now Texture.source');

        return this._source;
    }

    /** an Empty Texture used internally by the engine */
    public static EMPTY: Texture;
    /** a White texture used internally by the engine */
    public static WHITE: Texture;
}

Texture.EMPTY = new Texture({

});

Texture.EMPTY.label = 'EMPTY';
Texture.EMPTY.destroy = NOOP;

// create a white canvas
const canvas = DOMAdapter.get().createCanvas();

const size = 1;

canvas.width = size;
canvas.height = size;

const ctx = canvas.getContext('2d');

ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, size, size);

// draw red triangle
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(size, 0);
ctx.lineTo(size, size);
ctx.closePath();
ctx.fillStyle = '#ffffff';
ctx.fill();

Texture.WHITE = new Texture({
    source: new ImageSource({
        resource: canvas,
        alphaMode: 'premultiply-alpha-on-upload'
    }),
});

Texture.WHITE.label = 'WHITE';
Texture.WHITE.destroy = NOOP;
