import type { LoaderParser } from './parsers';

export interface LoadAsset<T=any>
{
    src: string;
    data?: T;
    alias?: string[];
    format?: string;
}

export interface PromiseAndParser
{
    promise: Promise<any>
    parser: LoaderParser
}
