/**
 * this function exists as path.isAbsolute tests if a path is an absolute file path...
 * rather than a url!
 *
 * taken directly from here: https://github.com/sindresorhus/is-absolute-url/blob/master/index.js
 *
 * returns true if the url is absolute, false if relative.
 *
 * @param url - the url to test
 */
export function isAbsoluteUrl(url: string): boolean
{
    // Don't match Windows paths `c:\`
    if ((/^[a-zA-Z]:\\/).test(url))
    {
        return false;
    }

    // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
    // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
    return (/^[a-zA-Z][a-zA-Z\d+\-.]*:/).test(url);
}
