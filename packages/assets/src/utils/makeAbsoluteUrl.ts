import { isAbsoluteUrl } from './isAbsoluteUrl';
import { urlJoin } from './urlJoin';

export function getBaseUrl(url: string): string
{
    const re = new RegExp(/^.*\//);

    return re.exec(url.split('?')[0])[0].replace(new RegExp(/#\/|#/), '');
}

const baseUrl = getBaseUrl(document.baseURI ?? window.location.href);

/**
 * When loading from a webworker, we must use absolute paths.
 * If the url is already absolute we return it as is
 * If its not, we convert it
 *
 *
 * @param url - the url to test
 */
export function makeAbsoluteUrl(url: string, customBaseUrl?: string): string
{
    const base = customBaseUrl !== undefined ? getBaseUrl(customBaseUrl) : baseUrl;
    const absolutePath = isAbsoluteUrl(url) ? url : urlJoin(base, url);

    return absolutePath;
}
