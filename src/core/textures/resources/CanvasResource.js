import determineCrossOrigin from '../../utils/determineCrossOrigin';

export default class CanvasResource
{
    constructor(source)
    {
    	this.source = source;
    	this.loaded = true; // TODO rename to ready?
        this.width = source.width;
        this.height = source.height;

        this.uploadable = true;

        this.load = new Promise((resolve, reject) => {

            resolve(this);
        })
    }

    static from(canvas)
    {
        return new CanvasResource(canvas);
    }


}