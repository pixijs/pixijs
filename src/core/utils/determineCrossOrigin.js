import _url from 'url';

let tempAnchor;

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
export default function determineCrossOrigin(url, loc = window.location)
{
    // data: and javascript: urls are considered same-origin
    if (url.indexOf('data:') === 0)
    {
        return '';
    }

    // default is window.location
    loc = loc || window.location;

    if (!tempAnchor)
    {
        tempAnchor = document.createElement('a');
    }

    // let the browser determine the full href for the url of this resource and then
    // parse with the node url lib, we can't use the properties of the anchor element
    // because they don't work in IE9 :(
    tempAnchor.href = url;
    url = _url.parse(tempAnchor.href);

    const samePort = (!url.port && loc.port === '') || (url.port === loc.port);

    // if cross origin
    if (url.hostname !== loc.hostname || !samePort || url.protocol !== loc.protocol)
    {
        return 'anonymous';
    }

    return '';
}
