import { settings } from '@pixi/settings';
import { isAbsoluteUrl } from './isAbsoluteUrl';
import { urlJoin } from './urlJoin';

export function getBaseUrl(url: string): string
{
    const re = new RegExp(/^.*\//);

    return re.exec(url.split('?')[0])[0].replace(new RegExp(/#\/|#/), '');
}

let baseUrl: string;

/**
 * Converts URL to an absolute path.
 * When loading from a Web Worker, we must use absolute paths.
 * If the URL is already absolute we return it as is
 * If it's not, we convert it
 * @param url - The URL to test
 * @param customBaseUrl - The base URL to use
 */
export function makeAbsoluteUrl(url: string, customBaseUrl?: string): string
{
    if (!baseUrl)
    {
        baseUrl = getBaseUrl(settings.ADAPTER.getBaseUrl());
    }

    const base = customBaseUrl !== undefined ? getBaseUrl(customBaseUrl) : baseUrl;
    const absolutePath = isAbsoluteUrl(url) ? url : urlJoin(base, url);

    return absolutePath;
}
