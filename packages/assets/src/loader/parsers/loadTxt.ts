import { extname } from '../../utils/path';
import type { LoaderParser } from './LoaderParser';

/** simple loader plugin for loading json data */
export const loadTxt = {
    test(url: string): boolean
    {
        return (extname(url).includes('.txt'));
    },

    async load(url: string): Promise<string>
    {
        const response = await fetch(url);

        const txt = await response.text();

        return txt;
    },
} as LoaderParser;
