const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;

export default class State
{
	constructor(data)
	{
		this.data = 0;

		this.blendMode = 0;
		this.polygonOffset = 0;
	}

	set blend( value )
	{
		if( !!(this.data & (1 << BLEND)) !== value )
		{
			this.data ^= (1 << BLEND);
		}
	}

	get blend()
	{
		return !!(this.data & (1 << BLEND))
	}

	////////////

	set offsets( value )
	{
		if( !!(this.data & (1 << OFFSET)) !== value )
		{
			this.data ^= (1<<OFFSET);
		}
	}

	get offsets()
	{
		return !!(this.data & (1 << OFFSET))
	}

	////////////

	set culling( value )
	{
		if( !!(this.data & (1 << CULLING)) !== value )
		{
			this.data ^= (1<<CULLING);
		}
	}

	get culling()
	{
		return !!(this.data & (1 << CULLING))
	}

	////////////

	set depthTest( value )
	{
		if( !!(this.data & (1 << DEPTH_TEST)) !== value )
		{
			this.data ^= (1<<DEPTH_TEST);
		}
	}

	get depthTest()
	{
		return !!(this.data & (1 << DEPTH_TEST))
	}

	////////////

	set clockwiseFrontFace( value )
	{
		if( !!(this.data & (1 << WINDING)) !== value )
		{
			this.data ^= (1<<WINDING);
		}
	}

	get clockwiseFrontFace()
	{
		return !!(this.data & (1 << WINDING))
	}

	////////////

	set blendMode( value )
    {
    	this.blend = (value === 17)//none
    	this._blendMode = value;
    }

    get blendMode()
    {
    	return this._blendMode;
    }

    ////////////

    set polygonOffset( value )
    {
    	this.offsets = !!value;
    	this._polygonOffset = value;
    }

    get polygonOffset()
    {
    	return this._polygonOffset = value;

    }

    ////////////

    set cullFace( value )
    {
    	this.culling = !!value;
    	this._cullFace = value;
    }

    get cullFace()
    {
    	return this._cullFace = value;

    }

}