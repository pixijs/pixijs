import determineCrossOrigin from '../../utils/determineCrossOrigin';
import TextureResource from './TextureResource';

export default class ImageResource extends TextureResource
{
    constructor(source)
    {
        super(source);

        this.url = source.src;

        this.load = new Promise((resolve) =>
        {
            const source = this.source;

            source.onload = () =>
            {
                this.loaded = true;
                source.onload = null;
                source.onerror = null;
                this.width = source.width;
                this.height = source.height;

                if (window.createImageBitmap)
                {
                    window.createImageBitmap(source).then((imageBitmap) =>
                    {
                        this.source = imageBitmap;

                        resolve(this);
                    });
                }
                else
                {
                    resolve(this);
                }
            };

            if (source.complete && source.src)
            {
                this.loaded = true;
                source.onload = null;
                source.onerror = null;
                this.width = source.width;
                this.height = source.height;

                if (window.createImageBitmap)
                {
                    window.createImageBitmap(source).then((imageBitmap) =>
                    {
                        this.source = imageBitmap;

                        resolve(this);
                    });
                }
                else
                {
                    resolve(this);
                }
            }

        //    source.onerror = () => {
          //      reject('unable to load "' + source.src + '" resource cannot be found')
            // }
        });
    }

    destroy()
    {
        this.source.src = '';
    }

    static from(url, crossorigin)
    {
        const image = new Image();

        if (crossorigin === undefined && url.indexOf('data:') !== 0)
        {
            image.crossOrigin = determineCrossOrigin(url);
        }
        else if (crossorigin)
        {
            image.crossOrigin = 'anonymous';
        }

        image.src = url;

        return new ImageResource(image);
    }

}
