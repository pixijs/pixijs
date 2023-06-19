import type { LoaderParser } from './parsers';

export interface PromiseAndParser
{
    promise: Promise<any>
    parser: LoaderParser
}
