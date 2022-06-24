import { LoaderParser } from './parsers';

export interface LoadAsset<T=any>
{
    src: string;
    data?: T;
}

export interface PromiseAndParser
{
    promise: Promise<any>
    parser: LoaderParser
}
