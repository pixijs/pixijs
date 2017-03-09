
export default class BufferResource
{
    constructor(source)
    {
    	this.source = source;
    	this.loaded = false; // TODO rename to ready?
        this.width = 1;
        this.height = 1;

        this.load = new Promise((resolve, reject) => {

            resolve(this);

        })
    }

    static from(array)
    {
        return new BufferResource(array);
    }


}