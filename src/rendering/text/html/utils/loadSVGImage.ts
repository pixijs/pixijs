/**
 * This function loads an SVG image into an HTMLImageElement.
 * The image can then be uploaded as texture to the GPU.
 * iOS has a bug where embedded fonts are not available immediately after the image loads,
 * so we wait an arbitrary amount of time before resolving the promise.
 * @param image - The image to load the SVG into
 * @param url - The url to load the SVG from
 * @param delay - Whether to delay the load
 * @returns - A promise that resolves when the image has loaded
 */
export function loadSVGImage(image: HTMLImageElement, url: string, delay: boolean)
{
    return new Promise<void>(async (resolve) =>
    {
        // Safari has a known bug where embedded fonts are not available
        // immediately after the image loads, to compensate we wait an
        // arbitrary amount of time
        // @see https://bugs.webkit.org/show_bug.cgi?id=219770
        if (delay)
        {
            await new Promise<void>((resolve) => setTimeout(resolve, 100));
        }

        image.onload = () =>
        {
            resolve();
        };

        image.src = `data:image/svg+xml;charset=utf8,${encodeURIComponent(url)}`;
        image.crossOrigin = 'anonymous';
    });
}
