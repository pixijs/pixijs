import Runner from 'mini-runner';

export default class TextureResource
{
    constructor(source)
    {
        this.source = source;

        this.loaded = false; // TODO rename to ready?

        this.width = -1;
        this.height = -1;

        this.uploadable = true;

        this.resourceUpdated = new Runner('resourceUpdated');

        // create a prommise..
        this.load = null;
    }

    destroy()
    {
        // somthing
    }
}
