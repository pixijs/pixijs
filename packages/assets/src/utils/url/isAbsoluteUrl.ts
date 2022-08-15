import { settings } from '@pixi/settings';

/**
 * Used to check whether the given URL is an absolute URL or not.
 * An absolute URL is defined as a URL that contains the complete details needed to locate a file
 *
 * Adapted from here: https://github.com/sindresorhus/is-absolute-url/blob/master/index.js
 *
 * returns true if the URL is absolute, false if relative.
 * @param url - The URL to test
 */
export function isAbsoluteUrl(url: string): boolean
{
    // If running in node then an absolute URL will start will either a `/` on unix or disk drive on windows
    if (settings.ADAPTER.getNavigator().userAgent === 'node')
    {
        if ((/^[a-zA-Z][a-zA-Z\d+\-.]*:/).test(url)) return true;
        if (process.platform === 'win32') return (/^[a-zA-Z]:(\\|\/)/).test(url);

        return url.startsWith('/');
    }

    // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
    // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
    return (/^[a-zA-Z][a-zA-Z\d+\-.]*:/).test(url);
}
