import type { LoaderParser } from './parsers';

/**
 * The loader resource type.
 * @memberof PIXI
 */
export interface LoadAsset<T=any>
{
    /** The URL or relative path to the asset */
    src: string;
    /** Optional data */
    data?: T;
    /** Aliases associated with asset */
    alias?: string[];
    /** Format, ususally the file extension */
    format?: string;
    /** An override that will ensure that the asset is loaded with a specific parser */
    loadParser?: 'loadJson' | 'loadSVG' | 'loadTextures' | 'loadTxt' | 'loadVideo' | 'loadWebFont' | string;
}

export interface PromiseAndParser
{
    promise: Promise<any>
    parser: LoaderParser
}
