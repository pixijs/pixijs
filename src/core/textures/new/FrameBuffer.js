import Texture from './Texture'


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
    	this.colorTextures[index || 0] = texture || new Texture(this.width, this.height);// || new Texture();

        this.dirtyId++;
    	this.dirtyFormat++;

    	return this;
    }


    addDepthTexture(texture)
    {
    	this.depthTexture = texture || new Texture(this.width, this.height, 6402, 5123)//UNSIGNED_SHORT;


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
        if(width === this.width && height === this.height)return;

    	this.width = width;
    	this.height = height;

    	this.dirtyId++;
        this.dirtySize++;

        for (var i = 0; i < this.colorTextures.length; i++) {
            this.colorTextures[i].resize(width, height);
        }

        if(this.depthTexture)
        {
            this.depthTexture.resize(width, height)
        }
    }


}