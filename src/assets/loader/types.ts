import type { LoaderParser } from './parsers/LoaderParser';

/**
 * A promise and parser pair
 * @category assets
 * @advanced
 */
export interface PromiseAndParser
{
    /** the promise that is loading the asset */
    promise: Promise<any>
    /** the parser that is loading the asset */
    parser: LoaderParser
}
