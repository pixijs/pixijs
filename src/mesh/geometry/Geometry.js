import Attribute from './Attribute';
import GeometryStyle from './GeometryStyle';
import GeometryData from './GeometryData';

class Geometry
{

	constructor(data, style)
	{
	    this.style = style || new GeometryStyle();
	    this.data = data || new GeometryData();

	    this.glVertexArrayObjects = [];

	}

	addAttribute(id, buffer, size = 2, stride = 0, start = 0, normalised = false)
	{
	    this.style.addAttribute(id, new Attribute(buffer.id, size, stride, start, normalised));
	    this.data.add(buffer.id, buffer);

	    return this;
	}

	addIndex(buffer)
	{
	    this.data.addIndex(buffer);

	    return this;
	}

	destroy()
	{
		//TODO - this is wrong!
	    for (let i = 0; i < this.buffers.length; i++)
		{
	        this.buffers[i].destroy();
		}

	    this.buffers = null;
	    this.attributes = null;

	    for (let i = 0; i < this.glVertexArrayObjects.length; i++)
		{
	        this.glVertexArrayObjects[i].destroy();
		}

	    this.glVertexArrayObjects = null;

	    this.indexBuffer.destroy();
	    this.indexBuffer = null;
	}
}

export default Geometry;
