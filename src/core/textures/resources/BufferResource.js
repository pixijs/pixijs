import TextureResource from './TextureResource';

export default class BufferResource extends TextureResource
{
    constructor(source)
    {
    	super(source);

        this.uploadable = false;

        this.load = new Promise((resolve, reject) => {

            resolve(this);

        })
    }

    static from(array)
    {
        return new BufferResource(array);
    }
}