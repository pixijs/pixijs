import type { LoaderParser } from './parsers';

export interface LoadAsset<T=any>
{
    src: string;
    data?: T;
    alias?: string[];
    format?: string;
    /** an override that will ensure that the asset is loaded with a specific parser */
    loadParser?: string;
}

export interface PromiseAndParser
{
    promise: Promise<any>
    parser: LoaderParser
}
