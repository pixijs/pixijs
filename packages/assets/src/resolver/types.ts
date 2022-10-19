import type { ExtensionMetadata } from '@pixi/core';

/**
 * A prefer order lets the resolver know which assets to prefer depending on the various parameters passed to it.
 * @memberof PIXI
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
 * the object returned when a key is resolved to an asset.
 * it will contain any additional information passed in the asset was added.
 * @memberof PIXI
 */
export interface ResolveAsset extends Record<string, any>
{
    alias?: string[];
    src: string;
}

export type ResolverAssetsArray = {
    name: string | string[];
    srcs: string | ResolveAsset[];
}[];

export type ResolverAssetsObject = Record<string, (string | ResolveAsset)>;

/**
 * Structure of a bundle found in a manfest file
 * @memberof PIXI
 */
export interface ResolverBundle
{
    name: string;
    assets: ResolverAssetsArray | ResolverAssetsObject
}

/**
 * The expected format of a manifest. This would normally be auto generated ar made by the developer
 * @memberof PIXI
 */
export type ResolverManifest = {
    // room for more props as we go!
    bundles: ResolverBundle[];
};

/**
 * Format for url parser, will test a string and if it pass will then parse it, turning it into an ResolveAsset
 * @memberof PIXI
 */
export interface ResolveURLParser
{
    extension?: ExtensionMetadata;
    /** A config to adjust the parser */
    config?: Record<string, any>
    /** the test to perform on the url to determin if it should be parsed */
    test: (url: string) => boolean;
    /** the function that will convert the url into an object */
    parse: (value: string) => ResolveAsset;
}
