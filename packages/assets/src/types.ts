import type { LoaderParser } from './loader';

export type ArrayOr<T> = T | T[];
export type LoadParserName = 'loadTextures' | 'loadJson' | 'loadTxt' | 'loadWebFont' | 'loadSVG' | string;

/**
 * A fully resolved asset, with all the information needed to load it.
 * @memberof PIXI
 */
export interface ResolvedAsset<T=any>
{
    /** Aliases associated with asset */
    alias?: string[];
    /**
     * Please use `alias` instead.
     * @deprecated since 7.2.0
     */
    name?: string[];
    /** The URL or relative path to the asset */
    src: string;
    /**
     * Please use `src` instead.
     * @deprecated since 7.2.0
     */
    srcs?: string;
    /** Optional data */
    data?: T;
    /** Format, usually the file extension */
    format?: string;
    /** An override that will ensure that the asset is loaded with a specific parser */
    loadParser?: LoadParserName;
    [key: string]: any;
}

/**
 * Please use `ResolvedAsset` instead.
 * @memberof PIXI
 * @deprecated since 7.2.0
 */
export type ResolveAsset<T = any> = ResolvedAsset<T>;

/**
 * Please use `ResolvedAsset` instead.
 * @memberof PIXI
 * @deprecated since 7.2.0
 */
export type LoadAsset<T = any> = ResolvedAsset<T>;

// NOTE: Omit does not seem to work here
export type ResolvedSrc = Pick<ResolvedAsset, 'src' | 'srcs' | 'format' | 'loadParser' | 'data'> & {[key: string]: any;};
export type UnresolvedSrc = ArrayOr<string> | ArrayOr<ResolvedSrc>;

/**
 * An asset that has not been resolved yet.
 * @memberof PIXI
 */
export interface UnresolvedAsset<T=any> extends Omit<ResolvedAsset<T>, 'src' | 'srcs' | 'name' | 'alias'>
{
    /** Aliases associated with asset */
    alias?: ArrayOr<string>;
    /** The URL or relative path to the asset */
    src: UnresolvedSrc;
    /**
     * Please use `alias` instead.
     * @deprecated since 7.2.0
     */
    name?: ArrayOr<string>;
    /**
     * Please use `src` instead.
     * @deprecated since 7.2.0
     */
    srcs?: UnresolvedSrc
}

/**
 * The object version of an unresolved asset
 * @memberof PIXI
 */
export type UnresolvedAssetObject = Omit<UnresolvedAsset, 'name' | 'alias'>;

/**
 * Structure of a bundle found in a manifest file
 * @memberof PIXI
 */
export interface AssetBundle
{
    name: string;
    assets: UnresolvedAsset[] | Record<string, ArrayOr<string> | UnresolvedAssetObject>;
}

/**
 * The expected format of a manifest. This would normally be auto generated or made by the developer
 * @memberof PIXI
 */
export interface AssetsManifest
{
    bundles: AssetBundle[];
}

export interface PromiseAndParser
{
    promise: Promise<any>
    parser: LoaderParser
}
