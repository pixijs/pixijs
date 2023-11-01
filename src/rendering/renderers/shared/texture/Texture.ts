import EventEmitter from 'eventemitter3';
import { Cache } from '../../../../assets/cache/Cache';
import { uid } from '../../../../utils/data/uid';
import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';
import { NOOP } from '../../../../utils/misc/NOOP';
import { resourceToTexture } from './sources/resourceToTexture';
import { TextureSource } from './sources/TextureSource';
import { TextureLayout } from './TextureLayout';
import { TextureMatrix } from './TextureMatrix';

import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { BufferSourceOptions } from './sources/BufferSource';
import type { TextureSourceOptions } from './sources/TextureSource';
import type { TextureLayoutOptions } from './TextureLayout';

export interface TextureOptions
{
    source?: TextureSource;
    layout?: TextureLayout | TextureLayoutOptions
    label?: string;
    frame?: Rectangle;
}

export interface BindableTexture
{
    source: TextureSource;
}

export class Texture extends EventEmitter<{
    update: Texture
    destroy: Texture
}> implements BindableTexture
{
    public static from(id: string | TextureSource | TextureSourceOptions | BufferSourceOptions, skipCache = false): Texture
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
    public _layout: TextureLayout;
    /** @internal */
    public _source: TextureSource;

    constructor({ source, layout, label, frame }: TextureOptions = {})
    {
        super();

        this.label = label;
        this.source = source?.source ?? new TextureSource();

        layout = layout instanceof TextureLayout ? layout : new TextureLayout(layout);

        if (frame)
        {
            const { width, height } = this._source;

            (layout as TextureLayout).frame.x = frame.x / width;
            (layout as TextureLayout).frame.y = frame.y / height;

            (layout as TextureLayout).frame.width = frame.width / width;
            (layout as TextureLayout).frame.height = frame.height / height;

            (layout as TextureLayout).updateUvs();
        }

        this.layout = layout as TextureLayout;

        this.destroyed = false;
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

    get layout(): TextureLayout
    {
        return this._layout;
    }

    set layout(value: TextureLayout)
    {
        this._layout?.off('update', this.onUpdate, this);

        this._layout = value;

        value.on('update', this.onUpdate, this);

        this.emit('update', this);
    }

    get textureMatrix()
    {
        if (!this._textureMatrix)
        {
            this._textureMatrix = new TextureMatrix(this);
        }

        return this._textureMatrix;
    }

    set frameWidth(value: number)
    {
        this._layout.frame.width = value / this._source.width;
    }

    get frameWidth(): number
    {
        return (this._source.pixelWidth / this._source._resolution) * this._layout.frame.width;
    }

    set frameHeight(value: number)
    {
        this._layout.frame.height = value / this._source.height;
    }

    get frameHeight(): number
    {
        return (this._source.pixelHeight / this._source._resolution) * this._layout.frame.height;
    }

    set frameX(value: number)
    {
        if (value === 0)
        {
            this._layout.frame.x = 0;

            return;
        }

        this._layout.frame.x = (this._source.width) / value;
    }

    get frameX(): number
    {
        return (this._source.width) * this._layout.frame.x;
    }

    set frameY(value: number)
    {
        if (value === 0)
        {
            this._layout.frame.y = 0;

            return;
        }

        this._layout.frame.y = (this._source.height) / value;
    }

    get frameY(): number
    {
        return (this._source.height) * this._layout.frame.y;
    }

    /** The width of the Texture in pixels. */
    get width(): number
    {
        return (this._source.width) * this._layout.orig.width;
    }

    /** The height of the Texture in pixels. */
    get height(): number
    {
        return (this._source.height) * this._layout.orig.height;
    }

    /**
     * Destroys this texture
     * @param destroySource - Destroy the source when the texture is destroyed.
     */
    public destroy(destroySource = false)
    {
        if (this._layout)
        {
            this._layout.destroy();
            this._layout = null;
        }

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
