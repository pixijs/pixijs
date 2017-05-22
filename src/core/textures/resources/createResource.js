import ImageResource from './ImageResource';
import SVGResource from './SVGResource';
import CanvasResource from './CanvasResource';
import VideoResource from './VideoResource';

export default function createResource(source)
{
    if (typeof source === 'string')
    {
        // check if its a video..
        if (source.match(/\.(mp4|webm|ogg|h264|avi|mov)$/))
        {
            return new VideoResource.fromUrl(source);
            // video!
            // return Texture.fromVideoUrl(source);
            // return SVGResource.from(url);
        }
        else if (source.match(/\.(svg)$/))
        {
            // SVG
            return SVGResource.from(source);
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
