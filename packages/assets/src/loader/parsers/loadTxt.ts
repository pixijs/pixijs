import { extname } from '../../utils/path';
import type { LoaderParser } from './LoaderParser';

/** Simple loader plugin for loading text data */
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
