import ImageResource from './ImageResource';
import SVGResource from './SVGResource';
import CanvasResource from './CanvasResource';
import VideoResource from './VideoResource';

const videosTypes = ['mp4', 'm4v', 'webm', 'ogg', 'ogv', 'h264', 'avi', 'mov'];

export default function createResource(source)
{
    if (typeof source === 'string')
    {
        // search for file extension: period, 3-4 chars, then ?, # or EOL
        const result = (/\.(\w{3,4})(?:$|\?|#)/i).exec(source);

        if (result)
        {
            const extension = result[1].toLowerCase();

            // check if its a video..
            if (videosTypes.indexOf(extension) > -1)
            {
                return new VideoResource.fromUrl(source);
            }
            else if (extension === 'svg')
            {
                return SVGResource.from(source);
            }
        }

        // probably an image!
        return ImageResource.from(source);
    }
    else if (source instanceof HTMLImageElement)
    {
        return new ImageResource(source);
    }
    else if (source instanceof HTMLCanvasElement)
    {
        return new CanvasResource(source);
    }
    else if (source instanceof HTMLVideoElement)
    {
        return new VideoResource(source);
    }

    return source;
}
