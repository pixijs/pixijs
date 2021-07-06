import { extname } from 'path';

import { LoadPlugin } from './LoadPlugin';

/**
 * simple loader plugin for loading json data
 */
const loadJson = {
    test(url: string): boolean
    {
        return (extname(url).includes('.json'));
    },

    async load<T>(url: string): Promise<T>
    {
        const response = await fetch(url);

        const json = await response.json();

        return json;
    },
} as LoadPlugin;

export { loadJson };

