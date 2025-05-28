import type { ExtensionMetadata } from '../../extensions/Extensions';
import type { ResolvedAsset } from '../types';

/**
 * A prefer order lets the resolver know which assets to prefer depending on the various parameters passed to it.
 * @category assets
 * @standard
 */
export interface PreferOrder
{
    /** the importance order of the params */
    priority?: string[];
    params: {
        [key: string]: any;
    };
}

/**
 * Format for url parser, will test a string and if it pass will then parse it, turning it into an ResolvedAsset
 * @category assets
 * @advanced
 */
export interface ResolveURLParser
{
    extension?: ExtensionMetadata;
    /** A config to adjust the parser */
    config?: Record<string, any>
    /** the test to perform on the url to determine if it should be parsed */
    test: (url: string) => boolean;
    /** the function that will convert the url into an object */
    parse: (value: string) => ResolvedAsset & {[key: string]: any};
}
