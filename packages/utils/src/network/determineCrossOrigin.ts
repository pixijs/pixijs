import { url as _url } from '../url';

let tempAnchor: HTMLAnchorElement|undefined;

/**
 * Sets the `crossOrigin` property for this resource based on if the url
 * for this resource is cross-origin. If crossOrigin was manually set, this
 * function does nothing.
 * Nipped from the resource loader!
 *
 * @ignore
 * @param {string} url - The url to test.
 * @param {object} [loc=window.location] - The location object to test against.
 * @return {string} The crossOrigin value to use (or empty string for none).
 */
export function determineCrossOrigin(url: string, loc: Location = globalThis.location): string
{
    // data: and javascript: urls are considered same-origin
    if (url.indexOf('data:') === 0)
    {
        return '';
    }

    // default is window.location
    loc = loc || globalThis.location;

    if (!tempAnchor)
    {
        tempAnchor = document.createElement('a');
    }

    // let the browser determine the full href for the url of this resource and then
    // parse with the node url lib, we can't use the properties of the anchor element
    // because they don't work in IE9 :(
    tempAnchor.href = url;
    const parsedUrl = _url.parse(tempAnchor.href);

    const samePort = (!parsedUrl.port && loc.port === '') || (parsedUrl.port === loc.port);

    // if cross origin
    if (parsedUrl.hostname !== loc.hostname || !samePort || parsedUrl.protocol !== loc.protocol)
    {
        return 'anonymous';
    }

    return '';
}
