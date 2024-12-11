import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { ResolvedAsset } from '../../types';
import type { Loader } from '../Loader';

/**
 * The extension priority for loader parsers.
 * Helpful when managing multiple parsers that share the same extension test.
 * The higher priority parsers will be checked first.
 * @enum {number}
 */
export enum LoaderParserPriority
{
    /** Generic parsers: txt, json, webfonts */
    Low = 0,
    /** PixiJS assets with generic extensions: spritesheets, bitmapfonts  */
    Normal = 1,
    /** Specific texture types: svg, png, ktx, dds, basis */
    High = 2,
}

/** A more verbose version of the LoaderParser, allowing you to set the loaded, parsed, and unloaded asset separately */
export interface LoaderParserAdvanced<
    ASSET = any,
    PARSED_ASSET = ASSET,
    UNLOAD_ASSET = ASSET,
    META_DATA = any,
    CONFIG = Record<string, any>
>
{
    /** Should be ExtensionType.LoaderParser */
    extension?: ExtensionMetadata;

    /** A config to adjust the parser */
    config?: CONFIG;

    /** The name of the parser (this can be used when specifying loadParser in a ResolvedAsset) */
    name: string;

    /**
     * Each URL to load will be tested here,
     * if the test is passed the assets are loaded using the load function below.
     * Good place to test for things like file extensions!
     * @param url - The URL to test
     * @param resolvedAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    test?: (url: string, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => boolean;

    /**
     * This is the promise that loads the URL provided
     * resolves with a loaded asset if returned by the parser.
     * @param url - The URL to load
     * @param resolvedAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    load?: <T>(url: string, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<ASSET | T>;

    /**
     * This function is used to test if the parse function should be run on the asset
     * If this returns true then parse is called with the asset
     * @param asset - The loaded asset data
     * @param resolvedAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    testParse?: (asset: ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<boolean>;

    /**
     * Gets called on the asset it testParse passes. Useful to convert a raw asset into something more useful
     * @param asset - The loaded asset data
     * @param resolvedAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    parse?: <T>(asset: ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<PARSED_ASSET | T>;

    /**
     * If an asset is parsed using this parser, the unload function will be called when the user requests an asset
     * to be unloaded. This is useful for things like sounds or textures that can be unloaded from memory
     * @param asset - The asset to unload/destroy
     * @param resolvedAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    unload?: (asset: UNLOAD_ASSET, resolvedAsset?: ResolvedAsset<META_DATA>, loader?: Loader) => Promise<void> | void;
}

/**
 * The interface to define a loader parser *(all functions are optional)*.
 *
 * When you create a `parser` object, the flow for every asset loaded is:
 *
 * 1. `parser.test()` - Each URL to load will be tested here, if the test is passed the assets are
 * loaded using the load function below. Good place to test for things like file extensions!
 * 2. `parser.load()` - This is the promise that loads the URL provided resolves with a loaded asset
 * if returned by the parser.
 * 3. `parser.testParse()` - This function is used to test if the parse function should be run on the
 *  asset If this returns true then parse is called with the asset
 * 4. `parse.parse()` - Gets called on the asset it testParse passes. Useful to convert a raw asset
 *  into something more useful
 *
 * <br/>
 * Some loaders may only be used for parsing, some only for loading, and some for both!
 * @memberof assets
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LoaderParser<ASSET = any, META_DATA = any, CONFIG = Record<string, any>>
    extends LoaderParserAdvanced<ASSET, ASSET, ASSET, META_DATA, CONFIG> {}
