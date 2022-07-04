import path from 'path';
import fetch from 'cross-fetch';

/** simple loader plugin for loading json data */
export const loadTxt = {
    test(url: string): boolean
    {
        const tempUrl = new URL(url);
        const extension = path.extname(tempUrl.pathname);

        return extension.includes('txt');
    },

    async load(url: string): Promise<string>
    {
        const response = await fetch(url);

        const txt = await response.text();

        return txt;
    },
};

