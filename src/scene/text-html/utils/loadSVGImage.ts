import { type ImageLike } from '../../../environment/ImageLike';

/**
 * This function loads an SVG image into an IImage element.
 * The image can then be uploaded as texture to the GPU.
 * iOS has a bug where embedded fonts are not available immediately after the image loads,
 * so we wait an arbitrary amount of time before resolving the promise.
 * @param image - The image to load the SVG into
 * @param url - The url to load the SVG from
 * @param delay - How long to wait in milliseconds before loading, `true` waits 100ms and `false` or 0 does not wait
 * @returns - A promise that resolves when the image has loaded
 * @internal
 */
export function loadSVGImage(image: ImageLike, url: string, delay: boolean | number)
{
    const delayMs = delay === true ? 100 : Number(delay) || 0;

    return new Promise<void>(async (resolve) =>
    {
        // Safari has a known bug where embedded fonts are not available
        // immediately after the image loads, to compensate we wait an
        // arbitrary amount of time
        // @see https://bugs.webkit.org/show_bug.cgi?id=219770
        if (delayMs > 0)
        {
            await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
        }

        image.onload = () =>
        {
            resolve();
        };

        image.src = `data:image/svg+xml;charset=utf8,${encodeURIComponent(url)}`;
        image.crossOrigin = 'anonymous';
    });
}
