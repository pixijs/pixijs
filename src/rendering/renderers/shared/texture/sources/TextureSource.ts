import { Runner } from '../../runner/Runner';
import { TextureStyle } from '../TextureStyle';

import type { BindResource } from '../../../gpu/shader/BindResource';
import type { TEXTURE_DIMENSIONS, TEXTURE_FORMATS, TEXTURE_VIEW_DIMENSIONS } from '../const';
import type { BindableTexture } from '../Texture';
import type { TextureStyleOptions } from '../TextureStyle';

let UID = 0;
let RESOURCE_ID = 0;

export interface TextureSourceOptions<T extends Record<string, any> = any>
{
    resource?: T;

    width?: number;
    height?: number;
    resolution?: number;

    format?: TEXTURE_FORMATS;
    sampleCount?: number;
    antialias?: boolean;

    dimensions?: TEXTURE_DIMENSIONS;
    view?: TEXTURE_VIEW_DIMENSIONS;

    mipLevelCount?: number;
    autoGenerateMipmaps?: boolean;

    style?: TextureStyleOptions | TextureStyle;
}

export class TextureSource<T extends Record<string, any> = any> implements BindableTexture, BindResource
{
    uid = UID++;

    resourceType = 'textureSource';
    resourceId = RESOURCE_ID++;
    onResourceChange = new Runner('onResourceChange');

    type = 'unknown';

    // dimensions
    _resolution = 1;
    pixelWidth = 1;
    pixelHeight = 1;

    width = 1;
    height = 1;

    resource: T;

    // sample count for multisample textures
    // generally this is used only used internally by pixi!
    sampleCount = 1;

    // antialias = false;

    // mip stuff..
    mipLevelCount = 1; // overridden if autoGenerateMipmaps is true
    autoGenerateMipmaps = false;

    format: TEXTURE_FORMATS = 'rgba8unorm-srgb';
    viewDimensions: TEXTURE_VIEW_DIMENSIONS = '2d';
    dimension: TEXTURE_DIMENSIONS = '2d';

    style: TextureStyle;

    onSourceUpdate = new Runner('onSourceUpdate');
    onSourceDestroy = new Runner('onSourceDestroy');
    onSourceResize = new Runner('onSourceResize');

    styleSourceKey: number;

    // properties used when rendering to this texture..
    antialias = false;
    depthStencil = true;

    constructor(options: TextureSourceOptions<T> = {})
    {
        this.resource = options.resource;

        this._resolution = options.resolution ?? 1;

        if (options.width)
        {
            this.pixelWidth = options.width * this._resolution;
        }
        else
        {
            this.pixelWidth = options.resource?.width ?? 1;
        }

        if (options.height)
        {
            this.pixelHeight = options.height * this._resolution;
        }
        else
        {
            this.pixelHeight = options.resource?.height ?? 1;
        }

        this.width = this.pixelWidth / this._resolution;
        this.height = this.pixelHeight / this._resolution;

        this.format = options.format ?? 'bgra8unorm';
        this.viewDimensions = options.view ?? '2d';
        this.dimension = options.dimensions ?? '2d';
        this.mipLevelCount = options.mipLevelCount ?? 1;
        this.autoGenerateMipmaps = options.autoGenerateMipmaps ?? false;
        this.sampleCount = options.sampleCount ?? 1;
        this.antialias = options.antialias ?? false;

        const style = options.style ?? {};

        this.style = style instanceof TextureStyle ? style : new TextureStyle(style);
        this.style.onStyleUpdate.add(this);
        this.styleSourceKey = (this.style.resourceId << 24) + this.uid;
    }

    get source(): TextureSource
    {
        return this;
    }

    update()
    {
        this.onSourceUpdate.emit(this);
    }

    onStyleUpdate()
    {
        this.styleSourceKey = (this.style.resourceId << 24) + this.uid;
    }

    /** Destroys this texture source */
    destroy()
    {
        if (this.onSourceDestroy)
        {
            this.onSourceDestroy.emit(this);
            this.onSourceDestroy.removeAll();
            this.onSourceDestroy = null;
        }

        if (this.onResourceChange)
        {
            this.onResourceChange.removeAll();
            this.onResourceChange = null;
        }

        if (this.onSourceUpdate)
        {
            this.onSourceUpdate.removeAll();
            this.onSourceUpdate = null;
        }

        if (this.onSourceResize)
        {
            this.onSourceResize.removeAll();
            this.onSourceResize = null;
        }

        if (this.style)
        {
            this.style.destroy();
            this.style = null;
        }

        this.type = null;
        this.resource = null;
    }

    get resolution(): number
    {
        return this._resolution;
    }

    set resolution(resolution: number)
    {
        if (this._resolution === resolution) return;

        this._resolution = resolution;

        this.width = this.pixelWidth / resolution;
        this.height = this.pixelHeight / resolution;
    }

    resize(width?: number, height?: number, resolution?: number)
    {
        resolution = resolution || this._resolution;
        width = width || this.width;
        height = height || this.height;

        // make sure we work with rounded pixels
        const newPixelWidth = Math.round(width * resolution);
        const newPixelHeight = Math.round(height * resolution);

        this.width = newPixelWidth / resolution;
        this.height = newPixelHeight / resolution;

        this._resolution = resolution;

        if (this.pixelWidth === newPixelWidth && this.pixelHeight === newPixelHeight)
        {
            return;
        }

        this.pixelWidth = newPixelWidth;
        this.pixelHeight = newPixelHeight;

        this.onSourceResize.emit(this);

        this.resourceId++;
        this.onResourceChange.emit(this);
    }
}
