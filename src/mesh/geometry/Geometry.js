import Attribute from './Attribute';
import Buffer from './Buffer';
import GeometryStyle from './GeometryStyle';
import GeometryData from './GeometryData';

var UID = 0;

class Geometry
{

    constructor(data, style)
    {
        this.style = style || new GeometryStyle();
        this.data = data || new GeometryData();

        this.glVertexArrayObjects = [];

        this.id = UID++;
    }

    addAttribute(id, buffer, size = 2, stride = 0, start = 0, normalised = false)
    {
        // check if this is a buffer!
        if (!buffer.data)
        {
            // its an array!
            buffer = new Buffer(buffer);
        }

        this.style.addAttribute(id, new Attribute(buffer.id, size, stride, start, normalised));
        this.data.add(buffer.id, buffer);

        return this;
    }

    getAttribute(id)
    {
        return this.data[this.style.attributes[id].buffer];
    }

    addIndex(buffer)
    {
        if (!buffer.data)
        {
            // its an array!
            buffer = new Buffer(buffer);
        }

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
