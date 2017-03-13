
export default class ImageResource
{
    constructor(source)
    {
    	this.source = source;
    	this.loaded = false; // TODO rename to ready?
        this.width = -1;
        this.height = -1;

        this.uploadable = true;

        this.load = new Promise((resolve, reject) => {

            const source = this.source;

            source.onload = () => {
                this.loaded = true;
                source.onload = null;
                source.onerror = null;
                this.width = source.width;
                this.height = source.height;
                resolve(this);
            }

            if(source.complete && source.src)
            {
                this.loaded = true;
                source.onload = null;
                source.onerror = null;
                this.width = source.width;
                this.height = source.height;
                resolve(this);
            }
        })
    }

    static from(url)
    {
        var image = new Image();
        image.src = url;
        return new ImageResource(image);
    }


}