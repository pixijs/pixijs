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
 * This represents an asset that has been processed by the resolver and is ready to be loaded.
 * @example
 * ```ts
 * // Basic resolved asset
 * const asset: ResolvedAsset = {
 *     alias: ['hero'],
 *     src: 'hero.png',
 *     format: 'png'
 * };
 *
 * // Resolved asset with multiple aliases
 * const asset: ResolvedAsset = {
 *     alias: ['character', 'player'],
 *     src: 'character@2x.webp',
 *     format: 'webp',
 * };
 *
 * // Resolved asset with specific parser
 * const asset: ResolvedAsset = {
 *     alias: ['config'],
 *     src: 'data.txt',
 *     format: 'txt',
 *     loadParser: 'loadTxt'
 * };
 * ```
 * @category assets
 * @standard
 */
export interface ResolvedAsset<T = any>
{
    /** Array of alternative names for this asset. Used for looking up the same asset by different keys. */
    alias?: string[];
    /** The URL or relative path to the asset. This is the final, resolved path that will be used for loading. */
    src?: string;
    /**
     * Optional data passed to the asset loader.
     * Can include texture settings, parser options, or other asset-specific data.
     */
    data?: T;
    /** File format of the asset, usually the file extension. Used to determine which loader parser to use. */
    format?: string;
    /** Override to specify which parser should load this asset. Useful when file extensions don't match the content type. */
    loadParser?: LoadParserName;
}

/**
 * A fully resolved src specification after pattern resolution and format detection.
 * Unlike raw asset sources, this type represents the final, concrete source path and format.
 * @example
 * ```ts
 * // Basic resolved source
 * const src: ResolvedSrc = {
 *     src: 'images/sprite.png',
 *     format: 'png'
 * };
 *
 * // With resolution and format preferences
 * const src: ResolvedSrc = {
 *     src: 'images/sprite@2x.webp',
 *     format: 'webp',
 *     data: { resolution: 2 }
 * };
 *
 * // With specific loader
 * const src: ResolvedSrc = {
 *     src: 'data/config.txt',
 *     format: 'txt',
 *     loadParser: 'loadTxt',
 * };
 * ```
 * @remarks
 * - Pattern strings like `{png,webp}` are resolved to specific formats
 * - Resolution and format are determined based on browser support
 * - Used internally by the Assets system after resolution
 * - Data property can contain format-specific options
 * @see {@link AssetSrc} For unresolved source format
 * @see {@link ResolvedAsset} For complete resolved asset specification
 * @category assets
 * @advanced
 * @interface
 */
export type ResolvedSrc = Pick<ResolvedAsset, 'src' | 'format' | 'loadParser' | 'data'>;

/**
 * A valid asset source specification. This can be a URL string, a {@link ResolvedSrc},
 * or an array of either. The source defines where and how to load an asset.
 * @example
 * ```ts
 * // Single URL string
 * const src: AssetSrc = 'images/sprite.png';
 *
 * // Multiple format options
 * const src: AssetSrc = ['sprite.webp', 'sprite.png'];
 *
 * // With format pattern
 * const src: AssetSrc = 'sprite.{webp,png}';
 *
 * // Resolved source with options
 * const src: AssetSrc = {
 *     src: 'sprite.png',
 *     format: 'png',
 *     loadParser: 'loadTextures',
 *     data: {
 *         scaleMode: 'nearest',
 *     }
 * };
 *
 * // Array of resolved sources
 * const src: AssetSrc = [
 *     {
 *         src: 'sprite@2x.webp',
 *         format: 'webp',
 *     },
 *     {
 *         src: 'sprite.png',
 *         format: 'png',
 *     }
 * ];
 * ```
 * @remarks
 * When specifying multiple formats:
 * - The format that is selected will depend on {@link AssetInitOptions.texturePreference}
 * - Resolution is parsed from file names
 * - Custom data can be passed to loaders
 * @see {@link ResolvedSrc} For resolved source format
 * @see {@link Assets.add} For adding assets with sources
 * @category assets
 * @standard
 */
export type AssetSrc = ArrayOr<string> | ArrayOr<ResolvedSrc> & { [key: string]: any; };

/**
 * An asset that has not been resolved yet. This is the initial format used when adding assets
 * to the Assets system before they are processed into a {@link ResolvedAsset}.
 * @example
 * ```ts
 * // Basic unresolved asset
 * const asset: UnresolvedAsset = {
 *     alias: 'hero',
 *     src: 'hero.png'
 * };
 *
 * // Multiple aliases and formats
 * const asset: UnresolvedAsset = {
 *     alias: ['hero', 'player'],
 *     src: 'hero.{webp,png}',
 *     data: {
 *         scaleMode: 'nearest',
 *     }
 * };
 *
 * // Asset with multiple sources and formats
 * const asset: UnresolvedAsset = {
 *     alias: 'background',
 *     src: [
 *         'bg@2x.webp',
 *         'bg@1x.webp',
 *         'bg@2x.png',
 *         'bg@1x.png',
 *     ]
 * };
 *
 * // With specific loader
 * const asset: UnresolvedAsset = {
 *     alias: 'config',
 *     src: 'data.txt',
 *     loadParser: 'loadTxt'
 * };
 * ```
 * @remarks
 * - Used as input format when adding assets to the system
 * - Can specify multiple aliases for the same asset
 * - Supports format patterns for browser compatibility
 * - Can include loader-specific data and options
 * @see {@link ResolvedAsset} For the resolved asset format
 * @see {@link Assets.add} For adding unresolved assets
 * @category assets
 * @standard
 * @interface
 */
export type UnresolvedAsset<T=any> = Pick<ResolvedAsset<T>, 'data' | 'format' | 'loadParser'> &
{
    /** Aliases associated with asset */
    alias?: ArrayOr<string>;
    /** The URL or relative path to the asset */
    src?: AssetSrc;
    [key: string]: any;
};

/**
 * Structure of a bundle found in a {@link AssetsManifest} file. Bundles allow you to
 * group related assets together for easier management and loading.
 * @example
 * ```ts
 * // Basic bundle structure
 * const bundle: AssetsBundle = {
 *     name: 'level-1',
 *     assets: [
 *         {
 *             alias: 'background',
 *             src: 'level1/bg.{webp,png}'
 *         },
 *         {
 *             alias: 'sprites',
 *             src: 'level1/sprites.json'
 *         }
 *     ]
 * };
 *
 * // Using object format for assets
 * const bundle: AssetsBundle = {
 *     name: 'ui',
 *     assets: {
 *         button: 'ui/button.png',
 *         panel: 'ui/panel.png',
 *         icons: ['ui/icons.webp', 'ui/icons.png']
 *     }
 * };
 * ```
 * @see {@link Assets.addBundle} For adding bundles programmatically
 * @see {@link Assets.loadBundle} For loading bundles
 * @category assets
 * @standard
 */
export interface AssetsBundle
{
    /** Unique identifier for the bundle */
    name: string;
    /** Assets contained in the bundle. Can be an array of assets or a record mapping aliases to sources. */
    assets: UnresolvedAsset[] | Record<string, ArrayOr<string> | UnresolvedAsset>;
}

/**
 * The manifest format for defining all assets in your application. Manifests provide a
 * structured way to organize and manage your assets through bundles.
 * @example
 * ```ts
 * const manifest: AssetsManifest = {
 *     bundles: [
 *         {
 *             name: 'loading',
 *             assets: [
 *                 {
 *                     alias: 'logo',
 *                     src: 'logo.{webp,png}',
 *                     data: { scaleMode: 'nearest' }
 *                 },
 *                 {
 *                     alias: 'progress-bar',
 *                     src: 'progress.png'
 *                 }
 *             ]
 *         },
 *         {
 *             name: 'game',
 *             assets: {
 *                 background: ['bg.webp', 'bg.png'],
 *                 character: 'hero.json',
 *                 music: 'theme.mp3'
 *             }
 *         }
 *     ]
 * };
 *
 * // Initialize with manifest
 * await Assets.init({ manifest });
 *
 * // Load bundles as needed
 * await Assets.loadBundle('loading');
 * await Assets.loadBundle('game');
 * ```
 * @see {@link Assets.init} For initializing with a manifest
 * @see {@link AssetsBundle} For bundle structure details
 * @category assets
 * @standard
 */
export interface AssetsManifest
{
    /** Array of asset bundles that make up the manifest */
    bundles: AssetsBundle[];
}
