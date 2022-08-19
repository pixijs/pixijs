import { extensions, ExtensionType } from '@pixi/core';
import { settings } from '@pixi/settings';
import { path } from '@pixi/utils';
import type { LoaderParser } from './LoaderParser';
import { LoaderParserPriority } from './LoaderParser';

/** simple loader plugin for loading json data */
export const loadJson = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low,
    },

    test(url: string): boolean
    {
        return (path.extname(url).includes('.json'));
    },

    async load<T>(url: string): Promise<T>
    {
        const response = await settings.ADAPTER.fetch(url);

        const json = await response.json();

        return json as T;
    },
} as LoaderParser;

extensions.add(loadJson);
