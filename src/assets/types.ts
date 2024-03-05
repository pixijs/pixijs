export type ArrayOr<T> = T | T[];

/**
 * Names of the parsers that are built into PixiJS.
 * Can be any of the following defaults:
 * - `loadJson`
 * - `loadSVG`
 * - `loadTextures`
 * - `loadTxt`
 * - `loadVideo`
 * - `loadWebFont`
 * or a custom parser name.
 * @memberof assets
 */
export type LoadParserName =
    | 'loadJson'
    | 'loadSVG'
    | 'loadTextures'
    | 'loadTxt'
    | 'loadVideo'
    | 'loadWebFont'
    | string;

/**
 * A fully resolved asset, with all the information needed to load it.
 * @memberof assets
 */
export interface ResolvedAsset<T=any>
{
    /** Aliases associated with asset */
    alias?: string[];
    /** The URL or relative path to the asset */
    src?: string;
    /** Optional data */
    data?: T;
    /** Format, usually the file extension */
    format?: string;
    /** An override that will ensure that the asset is loaded with a specific parser */
    loadParser?: LoadParserName;
}

/**
 * A fully resolved src, Glob patterns will not work here, and the src will be resolved to a single file.
 * @memberof assets
 * @property {string} src - The URL or relative path to the asset
 * @property {string} format - Format, usually the file extension
 * @property {string} loadParser - An override that will ensure that the asset is loaded with a specific parser
 * @property {any} data - Optional data
 */
// NOTE: Omit does not seem to work here
export type ResolvedSrc = Pick<ResolvedAsset, 'src' | 'format' | 'loadParser' | 'data'>;

/**
 * A valid asset src. This can be a string, or a [ResolvedSrc]{@link assets.ResolvedSrc},
 * or an array of either.
 * @memberof assets
 */
export type AssetSrc = ArrayOr<string> | ArrayOr<ResolvedSrc> & { [key: string]: any; };

/**
 * An asset that has not been resolved yet.
 * @memberof assets
 */
// NOTE: Omit does not seem to work here
export type UnresolvedAsset<T=any> = Pick<ResolvedAsset<T>, 'data' | 'format' | 'loadParser'> &
{
    /** Aliases associated with asset */
    alias?: ArrayOr<string>;
    /** The URL or relative path to the asset */
    src?: AssetSrc;
    [key: string]: any;
};

/**
 * Structure of a bundle found in a {@link assets.AssetsManifest Manifest} file
 * @memberof assets
 */
export interface AssetsBundle
{
    /** The name of the bundle */
    name: string;
    /** The assets in the bundle */
    assets: UnresolvedAsset[] | Record<string, ArrayOr<string> | UnresolvedAsset>;
}

/**
 * The expected format of a manifest. This could be auto generated or hand made
 * @memberof assets
 */
export interface AssetsManifest
{
    /** array of bundles */
    bundles: AssetsBundle[];
}
