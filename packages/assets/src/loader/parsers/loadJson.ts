import { ExtensionType } from '@pixi/core';
import { settings } from '@pixi/settings';
import { extname } from '../../utils/path';
import type { LoaderParser } from './LoaderParser';

/** simple loader plugin for loading json data */
export const loadJson = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return (extname(url).includes('.json'));
    },

    async load<T>(url: string): Promise<T>
    {
        const response = await settings.ADAPTER.fetch(url);

        const json = await response.json();

        return json as T;
    },
} as LoaderParser;
