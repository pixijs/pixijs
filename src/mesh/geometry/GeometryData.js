export default class GeometryData
{
    constructor()
    {
        this.buffers = [];
        this.indexBuffer = null;
    }

    add(id, buffer)
    {
        // only one!
        if (this.buffers.indexOf(buffer) === -1)
        {
            this.buffers.push(buffer);
            this[id] = buffer;
        }

        return this;
    }

    addIndex(buffer)
    {
        buffer.index = true;
        this.indexBuffer = buffer;

        if (this.buffers.indexOf(buffer) === -1)
        {
            this.buffers.push(buffer);
        }

        return this;
    }
}