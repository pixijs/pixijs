/**
 * A utility type that allows a value to be either a single item of type T or an array of items of type T.
 * @category utils
 * @advanced
 */
export type ArrayOr<T> = T | T[];

/**
 * Names of the parsers that are built into PixiJS.
 * Can be any of the following defaults:
 * - `loadJson`
 * - `loadSvg`
 * - `loadTextures`
 * - `loadTxt`
 * - `loadVideo`
 * - `loadWebFont`
 * or a custom parser name.
 * @category assets
 * @advanced
 */
export type LoadParserName =
    | 'loadJson'
    | 'loadSvg'
    | 'loadTextures'
    | 'loadTxt'
    | 'loadVideo'
    | 'loadWebFont'
    | (string & {});

/**
 * A fully resolved asset, with all the information needed to load it.
 * @category assets
 * @standard
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
 * @category assets
 * @advanced
 */
// NOTE: Omit does not seem to work here
export type ResolvedSrc = Pick<ResolvedAsset, 'src' | 'format' | 'loadParser' | 'data'>;

/**
 * A valid asset src. This can be a string, or a [ResolvedSrc]{@link ResolvedSrc},
 * or an array of either.
 * @category assets
 * @standard
 */
export type AssetSrc = ArrayOr<string> | ArrayOr<ResolvedSrc> & { [key: string]: any; };

/**
 * An asset that has not been resolved yet.
 * @category assets
 * @standard
 * @interface
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
 * Structure of a bundle found in a {@link AssetsManifest Manifest} file
 * @category assets
 * @standard
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
 * @category assets
 * @standard
 */
export interface AssetsManifest
{
    /** array of bundles */
    bundles: AssetsBundle[];
}
