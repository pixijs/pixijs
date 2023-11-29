import EventEmitter from 'eventemitter3';
import { Cache } from '../../../../assets/cache/Cache';
import { groupD8 } from '../../../../maths/matrix/groupD8';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { uid } from '../../../../utils/data/uid';
import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';
import { NOOP } from '../../../../utils/misc/NOOP';
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

export interface TextureOptions
{
    source?: TextureSource;
    label?: string;
    frame?: Rectangle;
    orig?: Rectangle;
    trim?: Rectangle;
    defaultAnchor?: { x: number; y: number };
    defaultBorders?: TextureBorders;
    rotate?: number;
}

export interface BindableTexture
{
    source: TextureSource;
}

export type TextureSourceLike = TextureSource | TextureSourceOptions | BufferSourceOptions | string;

export class Texture extends EventEmitter<{
    update: Texture
    destroy: Texture
}> implements BindableTexture
{
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

    public label?: string;
    public id = uid('texture');
    public styleSourceKey = 0;

    /**
     * Has the texture been destroyed?
     * @readonly
     */
    public destroyed: boolean;

    // private _style: TextureStyle;
    private _textureMatrix: TextureMatrix;

    /** @internal */
    public _source: TextureSource;

    public rotate: number;
    public uvs: UVs = { x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };

    public defaultAnchor?: { x: number; y: number };
    public defaultBorders?: TextureBorders;

    public frame = new Rectangle();
    public orig: Rectangle;
    public trim: Rectangle;

    public noFrame = false;

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

    get source(): TextureSource
    {
        return this._source;
    }

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

    public static EMPTY: Texture;
    public static WHITE: Texture;
}

Texture.EMPTY = new Texture({

});

Texture.EMPTY.label = 'EMPTY';
Texture.EMPTY.destroy = NOOP;
