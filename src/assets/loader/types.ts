import type { LoaderParser } from './parsers/LoaderParser';

export interface PromiseAndParser
{
    promise: Promise<any>
    parser: LoaderParser
}
