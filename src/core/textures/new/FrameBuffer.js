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
    	this.colorTextures[index || 0] = texture || new Texture(this.width, this.height, 'rgba');// || new Texture();

    	this.dirtyId++;

    	return this;
    }

    addDepthTexture()
    {
    	this.depthTexture[0] = new Texture(this.width, this.height, 'depth');// || new Texture();
    	this.dirtyId++;
    	return this;
    }

    enableDepth()
    {
    	this.depth = true;

    	this.dirtyId++;

    	return this;
    }

    enableStencil()
    {
    	this.stencil = true;

    	this.dirtyId++;

    	return this;
    }

    resize(width, height)
    {
    	this.width = width;
    	this.height = height;

    	this.dirtyId++;
    }


}