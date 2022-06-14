import path from 'path';
import { URL } from 'url';

/** simple loader plugin for loading json data */
export const loadJSON = {
    test(url: string): boolean
    {
        const tempUrl = new URL(url);
        const extension = path.extname(tempUrl.pathname);

        return extension.includes('json');
    },

    async load<T>(url: string): Promise<T>
    {
        const response = await fetch(url);

        const json = await response.json();

        return json as T;
    },
};

