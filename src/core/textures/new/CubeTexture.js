import Texture from './Texture';
import ImageResource from './resources/ImageResource';

export default class CubeTexture extends Texture
{
    constructor(width, height, format)
    {
    	super(width, height, format);

    	this.target = 34067; // gl.TEXTURE_CUBE_MAP

    	this.resources = [];

    	this.positiveX = {side:0, texture:this, resource:null, texturePart:true, dirtyId:0};
    	this.negativeX = {side:1, texture:this, resource:null, texturePart:true, dirtyId:0};

    	this.positiveY = {side:2, texture:this, resource:null, texturePart:true, dirtyId:0};
    	this.negativeY = {side:3, texture:this, resource:null, texturePart:true, dirtyId:0};

		this.positiveZ = {side:4, texture:this, resource:null, texturePart:true, dirtyId:0};
    	this.negativeZ = {side:5, texture:this, resource:null, texturePart:true, dirtyId:0};


    	this.sides = [this.positiveX, this.negativeX,
    				  this.positiveY, this.negativeY,
    				  this.positiveZ, this.negativeZ];
    }

    setResource(resource, index)
    {
    	var side = this.sides[index];
    	side.resource = resource;

    	resource.load.then((resource) => {

    		if(side.resource === resource)
    		{
    			this.width = resource.width;
    			this.height = resource.height;
    			// we have not swapped half way!
    			//side.dirtyId++;
    			this.validate();

    			this.dirtyId++;
    		}

    	})
    }

    validate()
    {
    	let valid = true;

    	if(this.width === -1 || this.height === -1)
    	{
    		valid = false;
    	}

    	if(this.sides)
    	{
	    	for (var i = 0; i < this.sides.length; i++) {

	    		const side = this.sides[i];

	    		if(side.resource && !side.resource.loaded)
	    		{
	    			valid = false;
	    			break;
	    		}
	    	}
    	}


    	this.valid = valid;
    }

    static from(...urls)
    {
        var cubeTexture = new CubeTexture();

        for (var i = 0; i < 6; i++)
        {
        	cubeTexture.setResource(ImageResource.from(urls[i % urls.length]), i);
        }

        return cubeTexture;
    }
}