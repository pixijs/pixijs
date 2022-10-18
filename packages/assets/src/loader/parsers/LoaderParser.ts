import type { ExtensionMetadata } from '@pixi/core';
import type { Loader } from '../Loader';
import type { LoadAsset } from '../types';

/**
 * The extension priority for loader parsers.
 * Helpful when managing multiple parsers that share the same extension
 * test. The higher priority parsers will be checked first.
 */
export enum LoaderParserPriority
// eslint-disable-next-line @typescript-eslint/indent
{
    /** Generic parsers: txt, json, webfonts */
    Low = 0,
    /** PixiJS assets with generic extensions: spritesheets, bitmapfonts  */
    Normal = 1,
    /** Specific texture types: svg, png, ktx, dds, basis */
    High = 2,
}

/**
 * All functions are optional here. The flow:
 *
 * for every asset,
 *
 * 1. `parser.test()`: Test the asset url.
 * 2. `parser.load()`: If test passes call the load function with the url
 * 3. `parser.testParse()`: Test to see if the asset should be parsed by the plugin
 * 4. `parse.parse()`: If test is parsed, then run the parse function on the asset.
 *
 * some plugins may only be used for parsing,
 * some only for loading
 * and some for both!
 */
export interface LoaderParser<ASSET = any, META_DATA = any>
{
    extension?: ExtensionMetadata;

    /** A config to adjust the parser */
    config?: Record<string, any>
    /**
     * each URL to load will be tested here,
     * if the test is passed the assets are loaded using the load function below.
     * Good place to test for things like file extensions!
     * @param url - The URL to test
     * @param loadAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    test?: (url: string, loadAsset?: LoadAsset<META_DATA>, loader?: Loader) => boolean;

    /**
     * This is the promise that loads the URL provided
     * resolves with a loaded asset if returned by the parser.
     * @param url - The URL to load
     * @param loadAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    load?: <T>(url: string, loadAsset?: LoadAsset<META_DATA>, loader?: Loader) => Promise<T>;

    /**
     * This function is used to test if the parse function should be run on the asset
     * If this returns true then parse is called with the asset
     * @param asset - The loaded asset data
     * @param loadAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    testParse?: (asset: ASSET, loadAsset?: LoadAsset<META_DATA>, loader?: Loader) => Promise<boolean>;

    /**
     * Gets called on the asset it testParse passes. Useful to convert a raw asset into something more useful than
     * @param asset - The loaded asset data
     * @param loadAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    parse?: <T>(asset: ASSET, loadAsset?: LoadAsset<META_DATA>, loader?: Loader) => Promise<T>;

    /**
     * If an asset is parsed using this parser, the unload function will be called when the user requests an asset
     * to be unloaded. This is useful for things like sounds or textures that can be unloaded from memory
     * @param asset - The asset to unload/destroy
     * @param loadAsset - Any custom additional information relevant to the asset being loaded
     * @param loader - The loader instance
     */
    unload?: (asset: ASSET, loadAsset?: LoadAsset<META_DATA>, loader?: Loader) => void;
}
