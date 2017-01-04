class Attribute
{
    constructor(buffer, size = 2, stride = 0, start = 0, normalised = false)
    {
        this.buffer = buffer;
        this.normalized = normalised;
        this.size = size;
        this.stride = stride;
        this.start = start;
        this.type = null;
    }

    destroy()
    {
        this.buffer = null;
    }

    static from(buffer, stride, start, normalised)
    {
        return new Attribute(buffer, stride, start, normalised);
    }
}

module.exports = Attribute;
