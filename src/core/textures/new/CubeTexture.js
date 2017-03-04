import Texture from './Texture';

export default class CubeTexture extends Texture
{
    constructor(width, height, format)
    {
    	super(width, height, format);

    	this.isCube = true;

    	//this.side1 = {_glTextures:this.glTextures, id:1};
    	//this.side2 = {_glTextures:this.glTextures, id:2};
    	//this.side3 = {_glTextures:this.glTextures, id:3};
    	//this.side4 = {_glTextures:this.glTextures, id:4};
    	//this.side5 = {_glTextures:this.glTextures, id:5};
    	//this.side6 = {_glTextures:this.glTextures, id:6};
    }
}