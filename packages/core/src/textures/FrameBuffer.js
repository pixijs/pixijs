import Texture from './BaseTexture';
import { FORMATS, TYPES } from '@pixi/constants';

/**
 * Frame buffer
 * @class
 * @memberof PIXI
 */
export default class FrameBuffer
{
    constructor(width, height)
    {
        this.width = width || 100;
        this.height = height || 100;

        this.stencil = false;
        this.depth = false;

        this.dirtyId = 0;
        this.dirtyFormat = 0;
        this.dirtySize = 0;

        this.depthTexture = null;
        this.colorTextures = [];

        this.glFrameBuffers = {};
    }

    get colorTexture()
    {
        return this.colorTextures[0];
    }

    addColorTexture(index, texture)
    {
        // TODO add some validation to the texture - same width / height etc?
        this.colorTextures[index || 0] = texture || new Texture(null, { scaleMode: 0,
            resolution: 1,
            mipmap: false,
            width: this.width,
            height: this.height });// || new Texture();

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    addDepthTexture(texture)
    {
        /* eslint-disable max-len */
        this.depthTexture = texture || new Texture(null, { scaleMode: 0,
            resolution: 1,
            width: this.width,
            height: this.height,
            mipmap: false,
            format: FORMATS.DEPTH_COMPONENT,
            type: TYPES.UNSIGNED_SHORT });// UNSIGNED_SHORT;
        /* eslint-disable max-len */
        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    enableDepth()
    {
        this.depth = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    enableStencil()
    {
        this.stencil = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    resize(width, height)
    {
        if (width === this.width && height === this.height) return;

        this.width = width;
        this.height = height;

        this.dirtyId++;
        this.dirtySize++;

        for (let i = 0; i < this.colorTextures.length; i++)
        {
            this.colorTextures[i].setSize(width, height);
        }

        if (this.depthTexture)
        {
            this.depthTexture.setSize(width, height);
        }
    }
}
