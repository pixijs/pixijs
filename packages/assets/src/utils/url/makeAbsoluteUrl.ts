import { settings } from '@pixi/settings';
import { isAbsoluteUrl } from './isAbsoluteUrl';
import { urlJoin } from './urlJoin';

export function removeUrlParams(url: string): string
{
    if (url.length === 0) return url;
    const re = new RegExp(/^.*\//);

    return re.exec(url.split('?')[0])[0].replace(new RegExp(/#\/|#/), '');
}

let baseUrl: string;
let rootUrl: string;

/**
 * Converts URL to an absolute path.
 * When loading from a Web Worker, we must use absolute paths.
 * If the URL is already absolute we return it as is
 * If it's not, we convert it
 * @param url - The URL to test
 * @param customBaseUrl - The base URL to use
 * @param customRootUrl - The root URL to use
 */
export function makeAbsoluteUrl(url: string, customBaseUrl?: string, customRootUrl?: string): string
{
    if (!baseUrl)
    {
        baseUrl = settings.ADAPTER.getBaseUrl();
    }
    if (!rootUrl)
    {
        rootUrl = settings.ADAPTER.getRootUrl();
    }

    if (url.startsWith('/'))
    {
        return (customRootUrl ? customRootUrl : rootUrl) + url;
    }

    const base = customBaseUrl !== undefined ? removeUrlParams(customBaseUrl) : baseUrl;
    const absolutePath = isAbsoluteUrl(url) ? url : urlJoin(base, url);

    return absolutePath;
}
