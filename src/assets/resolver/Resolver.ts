import { warn } from '../../utils/logging/warn';
import { path } from '../../utils/path';
import { convertToList } from '../utils/convertToList';
import { createStringVariations } from '../utils/createStringVariations';
import { isSingleItem } from '../utils/isSingleItem';

import type {
    ArrayOr,
    AssetsBundle,
    AssetsManifest,
    AssetSrc,
    ResolvedAsset,
    ResolvedSrc,
    UnresolvedAsset,
} from '../types';
import type { PreferOrder, ResolveURLParser } from './types';

/**
 * Options for how the resolver deals with generating bundle ids
 * @memberof assets
 */
export interface BundleIdentifierOptions
{
    /** The character that is used to connect the bundleId and the assetId when generating a bundle asset id key */
    connector?: string;
    /**
     * A function that generates a bundle asset id key from a bundleId and an assetId
     * @param bundleId - the bundleId
     * @param assetId  - the assetId
     * @returns the bundle asset id key
     */
    createBundleAssetId?: (bundleId: string, assetId: string) => string;
    /**
     * A function that generates an assetId from a bundle asset id key. This is the reverse of generateBundleAssetId
     * @param bundleId - the bundleId
     * @param assetBundleId - the bundle asset id key
     * @returns the assetId
     */
    extractAssetIdFromBundle?: (bundleId: string, assetBundleId: string) => string;
}

/**
 * A class that is responsible for resolving mapping asset URLs to keys.
 * At its most basic it can be used for Aliases:
 *
 * ```js
 * resolver.add('foo', 'bar');
 * resolver.resolveUrl('foo') // => 'bar'
 * ```
 *
 * It can also be used to resolve the most appropriate asset for a given URL:
 *
 * ```js
 * resolver.prefer({
 *     params: {
 *         format: 'webp',
 *         resolution: 2,
 *     }
 * });
 *
 * resolver.add('foo', ['bar@2x.webp', 'bar@2x.png', 'bar.webp', 'bar.png']);
 *
 * resolver.resolveUrl('foo') // => 'bar@2x.webp'
 * ```
 * Other features include:
 * - Ability to process a manifest file to get the correct understanding of how to resolve all assets
 * - Ability to add custom parsers for specific file types
 * - Ability to add custom prefer rules
 *
 * This class only cares about the URL, not the loading of the asset itself.
 *
 * It is not intended that this class is created by developers - its part of the Asset class
 * This is the third major system of PixiJS' main Assets class
 * @memberof assets
 */
export class Resolver
{
    /**
     * The prefix that denotes a URL is for a retina asset.
     * @static
     * @name RETINA_PREFIX
     * @type {RegExp}
     * @default /@([0-9\.]+)x/
     * @example `@2x`
     */
    public static RETINA_PREFIX = /@([0-9\.]+)x/;

    private readonly _defaultBundleIdentifierOptions: Required<BundleIdentifierOptions> = {
        connector: '-',
        createBundleAssetId: (bundleId, assetId) =>
            `${bundleId}${this._bundleIdConnector}${assetId}`,
        extractAssetIdFromBundle: (bundleId, assetBundleId) =>
            assetBundleId.replace(`${bundleId}${this._bundleIdConnector}`, ''),
    };

    /** The character that is used to connect the bundleId and the assetId when generating a bundle asset id key */
    private _bundleIdConnector = this._defaultBundleIdentifierOptions.connector;

    /**
     * A function that generates a bundle asset id key from a bundleId and an assetId
     * @param bundleId - the bundleId
     * @param assetId  - the assetId
     * @returns the bundle asset id key
     */
    private _createBundleAssetId: (
        bundleId: string,
        assetId: string
    ) => string = this._defaultBundleIdentifierOptions.createBundleAssetId;

    /**
     * A function that generates an assetId from a bundle asset id key. This is the reverse of generateBundleAssetId
     * @param bundleId - the bundleId
     * @param assetBundleId - the bundle asset id key
     * @returns the assetId
     */
    private _extractAssetIdFromBundle: (
        bundleId: string,
        assetBundleId: string
    ) => string = this._defaultBundleIdentifierOptions.extractAssetIdFromBundle;

    private _assetMap: Record<string, ResolvedAsset[]> = {};
    private _preferredOrder: PreferOrder[] = [];
    private readonly _parsers: ResolveURLParser[] = [];

    private _resolverHash: Record<string, ResolvedAsset> = {};
    private _rootPath: string;
    private _basePath: string;
    private _manifest: AssetsManifest;
    private _bundles: Record<string, string[]> = {};
    private _defaultSearchParams: string;

    /**
     * Override how the resolver deals with generating bundle ids.
     * must be called before any bundles are added
     * @param bundleIdentifier - the bundle identifier options
     */
    public setBundleIdentifier(bundleIdentifier: BundleIdentifierOptions): void
    {
        this._bundleIdConnector = bundleIdentifier.connector ?? this._bundleIdConnector;
        this._createBundleAssetId = bundleIdentifier.createBundleAssetId ?? this._createBundleAssetId;
        this._extractAssetIdFromBundle = bundleIdentifier.extractAssetIdFromBundle ?? this._extractAssetIdFromBundle;

        if (this._extractAssetIdFromBundle('foo', this._createBundleAssetId('foo', 'bar')) !== 'bar')
        {
            throw new Error('[Resolver] GenerateBundleAssetId are not working correctly');
        }
    }

    /**
     * Let the resolver know which assets you prefer to use when resolving assets.
     * Multiple prefer user defined rules can be added.
     * @example
     * resolver.prefer({
     *     // first look for something with the correct format, and then then correct resolution
     *     priority: ['format', 'resolution'],
     *     params:{
     *         format:'webp', // prefer webp images
     *         resolution: 2, // prefer a resolution of 2
     *     }
     * })
     * resolver.add('foo', ['bar@2x.webp', 'bar@2x.png', 'bar.webp', 'bar.png']);
     * resolver.resolveUrl('foo') // => 'bar@2x.webp'
     * @param preferOrders - the prefer options
     */
    public prefer(...preferOrders: PreferOrder[]): void
    {
        preferOrders.forEach((prefer) =>
        {
            this._preferredOrder.push(prefer);

            if (!prefer.priority)
            {
                // generate the priority based on the order of the object
                prefer.priority = Object.keys(prefer.params);
            }
        });

        this._resolverHash = {};
    }

    /**
     * Set the base path to prepend to all urls when resolving
     * @example
     * resolver.basePath = 'https://home.com/';
     * resolver.add('foo', 'bar.ong');
     * resolver.resolveUrl('foo', 'bar.png'); // => 'https://home.com/bar.png'
     * @param basePath - the base path to use
     */
    public set basePath(basePath: string)
    {
        this._basePath = basePath;
    }

    public get basePath(): string
    {
        return this._basePath;
    }

    /**
     * Set the root path for root-relative URLs. By default the `basePath`'s root is used. If no `basePath` is set, then the
     * default value for browsers is `window.location.origin`
     * @example
     * // Application hosted on https://home.com/some-path/index.html
     * resolver.basePath = 'https://home.com/some-path/';
     * resolver.rootPath = 'https://home.com/';
     * resolver.add('foo', '/bar.png');
     * resolver.resolveUrl('foo', '/bar.png'); // => 'https://home.com/bar.png'
     * @param rootPath - the root path to use
     */
    public set rootPath(rootPath: string)
    {
        this._rootPath = rootPath;
    }

    public get rootPath(): string
    {
        return this._rootPath;
    }

    /**
     * All the active URL parsers that help the parser to extract information and create
     * an asset object-based on parsing the URL itself.
     *
     * Can be added using the extensions API
     * @example
     * resolver.add('foo', [
     *     {
     *         resolution: 2,
     *         format: 'png',
     *         src: 'image@2x.png',
     *     },
     *     {
     *         resolution:1,
     *         format:'png',
     *         src: 'image.png',
     *     },
     * ]);
     *
     * // With a url parser the information such as resolution and file format could extracted from the url itself:
     * extensions.add({
     *     extension: ExtensionType.ResolveParser,
     *     test: loadTextures.test, // test if url ends in an image
     *     parse: (value: string) =>
     *     ({
     *         resolution: parseFloat(Resolver.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
     *         format: value.split('.').pop(),
     *         src: value,
     *     }),
     * });
     *
     * // Now resolution and format can be extracted from the url
     * resolver.add('foo', [
     *     'image@2x.png',
     *     'image.png',
     * ]);
     */
    public get parsers(): ResolveURLParser[]
    {
        return this._parsers;
    }

    /** Used for testing, this resets the resolver to its initial state */
    public reset(): void
    {
        this.setBundleIdentifier(this._defaultBundleIdentifierOptions);

        this._assetMap = {};
        this._preferredOrder = [];
        // Do not reset this._parsers

        this._resolverHash = {};
        this._rootPath = null;
        this._basePath = null;
        this._manifest = null;
        this._bundles = {};
        this._defaultSearchParams = null;
    }

    /**
     * Sets the default URL search parameters for the URL resolver. The urls can be specified as a string or an object.
     * @param searchParams - the default url parameters to append when resolving urls
     */
    public setDefaultSearchParams(searchParams: string | Record<string, unknown>): void
    {
        if (typeof searchParams === 'string')
        {
            this._defaultSearchParams = searchParams;
        }
        else
        {
            const queryValues = searchParams as Record<string, any>;

            this._defaultSearchParams = Object.keys(queryValues)
                .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryValues[key])}`)
                .join('&');
        }
    }

    /**
     * Returns the aliases for a given asset
     * @param asset - the asset to get the aliases for
     */
    public getAlias(asset: UnresolvedAsset): string[]
    {
        const { alias, src } = asset;
        const aliasesToUse = convertToList<ArrayOr<string | AssetSrc>>(
            alias || src, (value: string | AssetSrc) =>
            {
                if (typeof value === 'string') return value;

                if (Array.isArray(value)) return value.map((v) => (v as ResolvedSrc)?.src ?? v);

                if (value?.src) return value.src;

                return value;
            }, true) as string[];

        return aliasesToUse;
    }

    /**
     * Add a manifest to the asset resolver. This is a nice way to add all the asset information in one go.
     * generally a manifest would be built using a tool.
     * @param manifest - the manifest to add to the resolver
     */
    public addManifest(manifest: AssetsManifest): void
    {
        if (this._manifest)
        {
            // #if _DEBUG
            warn('[Resolver] Manifest already exists, this will be overwritten');
            // #endif
        }

        this._manifest = manifest;

        manifest.bundles.forEach((bundle) =>
        {
            this.addBundle(bundle.name, bundle.assets);
        });
    }

    /**
     * This adds a bundle of assets in one go so that you can resolve them as a group.
     * For example you could add a bundle for each screen in you pixi app
     * @example
     * resolver.addBundle('animals', [
     *  { alias: 'bunny', src: 'bunny.png' },
     *  { alias: 'chicken', src: 'chicken.png' },
     *  { alias: 'thumper', src: 'thumper.png' },
     * ]);
     * // or
     * resolver.addBundle('animals', {
     *     bunny: 'bunny.png',
     *     chicken: 'chicken.png',
     *     thumper: 'thumper.png',
     * });
     *
     * const resolvedAssets = await resolver.resolveBundle('animals');
     * @param bundleId - The id of the bundle to add
     * @param assets - A record of the asset or assets that will be chosen from when loading via the specified key
     */
    public addBundle(bundleId: string, assets: AssetsBundle['assets']): void
    {
        const assetNames: string[] = [];
        let convertedAssets: UnresolvedAsset[] = assets as UnresolvedAsset[];

        if (!Array.isArray(assets))
        {
            // convert to array...
            convertedAssets = Object.entries(assets).map(([alias, src]) =>
            {
                if (typeof src === 'string' || Array.isArray(src))
                {
                    return { alias, src };
                }

                return { alias, ...src };
            });
        }

        // when storing keys against a bundle we prepend the bundleId to each asset key
        // and pass it through as an additional alias for the asset
        // this keeps clashing ids separate on a per-bundle basis
        // you can also resolve a file using the bundleId-assetId syntax

        convertedAssets.forEach((asset) =>
        {
            const srcs = asset.src;
            const aliases = asset.alias;
            let ids: string[];

            if (typeof aliases === 'string')
            {
                const bundleAssetId = this._createBundleAssetId(bundleId, aliases);

                assetNames.push(bundleAssetId);
                ids = [aliases, bundleAssetId];
            }
            else
            {
                const bundleIds = aliases.map((name) => this._createBundleAssetId(bundleId, name));

                assetNames.push(...bundleIds);
                ids = [...aliases, ...bundleIds];
            }

            this.add({
                ...asset,
                ...{
                    alias: ids,
                    src: srcs,
                }
            });
        });

        this._bundles[bundleId] = assetNames;
    }

    /**
     * Tells the resolver what keys are associated with witch asset.
     * The most important thing the resolver does
     * @example
     * // Single key, single asset:
     * resolver.add({alias: 'foo', src: 'bar.png');
     * resolver.resolveUrl('foo') // => 'bar.png'
     *
     * // Multiple keys, single asset:
     * resolver.add({alias: ['foo', 'boo'], src: 'bar.png'});
     * resolver.resolveUrl('foo') // => 'bar.png'
     * resolver.resolveUrl('boo') // => 'bar.png'
     *
     * // Multiple keys, multiple assets:
     * resolver.add({alias: ['foo', 'boo'], src: ['bar.png', 'bar.webp']});
     * resolver.resolveUrl('foo') // => 'bar.png'
     *
     * // Add custom data attached to the resolver
     * Resolver.add({
     *     alias: 'bunnyBooBooSmooth',
     *     src: 'bunny{png,webp}',
     *     data: { scaleMode:SCALE_MODES.NEAREST }, // Base texture options
     * });
     *
     * resolver.resolve('bunnyBooBooSmooth') // => { src: 'bunny.png', data: { scaleMode: SCALE_MODES.NEAREST } }
     * @param aliases - the UnresolvedAsset or array of UnresolvedAssets to add to the resolver
     */
    public add(
        aliases: ArrayOr<UnresolvedAsset>,
    ): void
    {
        const assets: UnresolvedAsset[] = [];

        if (Array.isArray(aliases))
        {
            assets.push(...(aliases as UnresolvedAsset[]));
        }
        else
        {
            assets.push(aliases as UnresolvedAsset);
        }

        let keyCheck: (key: string) => void;

        // #if _DEBUG
        // eslint-disable-next-line prefer-const
        keyCheck = (key: string) =>
        {
            if (this.hasKey(key))
            {
                // #if _DEBUG
                warn(`[Resolver] already has key: ${key} overwriting`);
                // #endif
            }
        };
        // #endif

        const assetArray = convertToList(assets);

        // loop through all the assets and generate a resolve asset for each src
        assetArray.forEach((asset) =>
        {
            const { src } = asset;
            let { data, format, loadParser } = asset;

            // src can contain an unresolved asset itself
            // so we need to merge that data with the current asset
            // we dont need to create string variations for the src if it is a ResolvedAsset
            const srcsToUse: (string | ResolvedSrc)[][] = convertToList<AssetSrc>(src).map((src) =>
            {
                if (typeof src === 'string')
                { return createStringVariations(src); }

                return Array.isArray(src) ? src : [src];
            });

            const aliasesToUse = this.getAlias(asset);

            // #if _DEBUG
            Array.isArray(aliasesToUse) ? aliasesToUse.forEach(keyCheck) : keyCheck(aliasesToUse);
            // #endif

            // loop through all the srcs and generate a resolve asset for each src
            const resolvedAssets: ResolvedAsset[] = [];

            srcsToUse.forEach((srcs) =>
            {
                srcs.forEach((src) =>
                {
                    let formattedAsset = {} as ResolvedAsset;

                    if (typeof src !== 'object')
                    {
                        formattedAsset.src = src;
                        // first see if it contains any {} tags...
                        for (let i = 0; i < this._parsers.length; i++)
                        {
                            const parser = this._parsers[i];

                            if (parser.test(src))
                            {
                                formattedAsset = parser.parse(src);
                                break;
                            }
                        }
                    }
                    else
                    {
                        data = src.data ?? data;
                        format = src.format ?? format;
                        loadParser = src.loadParser ?? loadParser;
                        formattedAsset = {
                            ...formattedAsset,
                            ...src,
                        };
                    }

                    // check if aliases is undefined
                    if (!aliasesToUse)
                    {
                        throw new Error(`[Resolver] alias is undefined for this asset: ${formattedAsset.src}`);
                    }

                    formattedAsset = this._buildResolvedAsset(formattedAsset, {
                        aliases: aliasesToUse,
                        data,
                        format,
                        loadParser,
                    });

                    resolvedAssets.push(formattedAsset);
                });
            });

            aliasesToUse.forEach((alias) =>
            {
                this._assetMap[alias] = resolvedAssets;
            });
        });
    }

    // TODO: this needs an overload like load did in Assets
    /**
     * If the resolver has had a manifest set via setManifest, this will return the assets urls for
     * a given bundleId or bundleIds.
     * @example
     * // Manifest Example
     * const manifest = {
     *     bundles: [
     *         {
     *             name: 'load-screen',
     *             assets: [
     *                 {
     *                     alias: 'background',
     *                     src: 'sunset.png',
     *                 },
     *                 {
     *                     alias: 'bar',
     *                     src: 'load-bar.{png,webp}',
     *                 },
     *             ],
     *         },
     *         {
     *             name: 'game-screen',
     *             assets: [
     *                 {
     *                     alias: 'character',
     *                     src: 'robot.png',
     *                 },
     *                 {
     *                     alias: 'enemy',
     *                     src: 'bad-guy.png',
     *                 },
     *             ],
     *         },
     *     ]
     * };
     *
     * resolver.setManifest(manifest);
     * const resolved = resolver.resolveBundle('load-screen');
     * @param bundleIds - The bundle ids to resolve
     * @returns All the bundles assets or a hash of assets for each bundle specified
     */
    public resolveBundle(bundleIds: ArrayOr<string>):
    Record<string, ResolvedAsset> | Record<string, Record<string, ResolvedAsset>>
    {
        const singleAsset = isSingleItem(bundleIds);

        bundleIds = convertToList<string>(bundleIds);

        const out: Record<string, Record<string, ResolvedAsset>> = {};

        bundleIds.forEach((bundleId) =>
        {
            const assetNames = this._bundles[bundleId];

            if (assetNames)
            {
                const results = this.resolve(assetNames) as Record<string, ResolvedAsset>;

                const assets: Record<string, ResolvedAsset> = {};

                for (const key in results)
                {
                    const asset = results[key];

                    assets[this._extractAssetIdFromBundle(bundleId, key)] = asset;
                }

                out[bundleId] = assets;
            }
        });

        return singleAsset ? out[bundleIds[0]] : out;
    }

    /**
     * Does exactly what resolve does, but returns just the URL rather than the whole asset object
     * @param key - The key or keys to resolve
     * @returns - The URLs associated with the key(s)
     */
    public resolveUrl(key: ArrayOr<string>): string | Record<string, string>
    {
        const result = this.resolve(key as string) as ResolvedAsset | Record<string, ResolvedAsset>;

        if (typeof key !== 'string')
        {
            const out: Record<string, string> = {};

            for (const i in result)
            {
                out[i] = (result as Record<string, ResolvedAsset>)[i].src;
            }

            return out;
        }

        return (result as ResolvedAsset).src;
    }

    /**
     * Resolves each key in the list to an asset object.
     * Another key function of the resolver! After adding all the various key/asset pairs. this will run the logic
     * of finding which asset to return based on any preferences set using the `prefer` function
     * by default the same key passed in will be returned if nothing is matched by the resolver.
     * @example
     * resolver.add('boo', 'bunny.png');
     *
     * resolver.resolve('boo') // => { src: 'bunny.png' }
     *
     * // Will return the same string as no key was added for this value..
     * resolver.resolve('another-thing.png') // => { src: 'another-thing.png' }
     * @param keys - key or keys to resolve
     * @returns - the resolve asset or a hash of resolve assets for each key specified
     */
    public resolve(keys: string): ResolvedAsset;
    public resolve(keys: string[]): Record<string, ResolvedAsset>;
    public resolve(keys: ArrayOr<string>): ResolvedAsset | Record<string, ResolvedAsset>
    {
        const singleAsset = isSingleItem(keys);

        keys = convertToList<string>(keys);

        const result: Record<string, ResolvedAsset> = {};

        keys.forEach((key) =>
        {
            if (!this._resolverHash[key])
            {
                if (this._assetMap[key])
                {
                    let assets = this._assetMap[key];
                    const preferredOrder = this._getPreferredOrder(assets);

                    preferredOrder?.priority.forEach((priorityKey) =>
                    {
                        preferredOrder.params[priorityKey].forEach((value: unknown) =>
                        {
                            const filteredAssets = assets.filter((asset) =>
                            {
                                if (asset[priorityKey as keyof ResolvedAsset])
                                {
                                    return asset[priorityKey as keyof ResolvedAsset] === value;
                                }

                                return false;
                            });

                            if (filteredAssets.length)
                            {
                                assets = filteredAssets;
                            }
                        });
                    });

                    this._resolverHash[key] = assets[0];
                }
                else
                {
                    this._resolverHash[key] = this._buildResolvedAsset({
                        alias: [key],
                        src: key,
                    }, {});
                }
            }

            result[key] = this._resolverHash[key];
        });

        return singleAsset ? result[keys[0]] : result;
    }

    /**
     * Checks if an asset with a given key exists in the resolver
     * @param key - The key of the asset
     */
    public hasKey(key: string): boolean
    {
        return !!this._assetMap[key];
    }

    /**
     * Checks if a bundle with the given key exists in the resolver
     * @param key - The key of the bundle
     */
    public hasBundle(key: string): boolean
    {
        return !!this._bundles[key];
    }

    /**
     * Internal function for figuring out what prefer criteria an asset should use.
     * @param assets
     */
    private _getPreferredOrder(assets: ResolvedAsset[]): PreferOrder
    {
        for (let i = 0; i < assets.length; i++)
        {
            const asset = assets[i];

            const preferred = this._preferredOrder.find((preference: PreferOrder) =>
                preference.params.format.includes(asset.format));

            if (preferred)
            {
                return preferred;
            }
        }

        return this._preferredOrder[0];
    }

    /**
     * Appends the default url parameters to the url
     * @param url - The url to append the default parameters to
     * @returns - The url with the default parameters appended
     */
    private _appendDefaultSearchParams(url: string): string
    {
        if (!this._defaultSearchParams) return url;

        const paramConnector = (/\?/).test(url) ? '&' : '?';

        return `${url}${paramConnector}${this._defaultSearchParams}`;
    }

    private _buildResolvedAsset(formattedAsset: ResolvedAsset, data?: {
        aliases?: string[],
        data?: Record<string, unknown>
        loadParser?: string,
        format?: string,
    }): ResolvedAsset
    {
        const { aliases, data: assetData, loadParser, format } = data;

        if (this._basePath || this._rootPath)
        {
            formattedAsset.src = path.toAbsolute(formattedAsset.src, this._basePath, this._rootPath);
        }

        formattedAsset.alias = aliases ?? formattedAsset.alias ?? [formattedAsset.src];
        formattedAsset.src = this._appendDefaultSearchParams(formattedAsset.src);
        formattedAsset.data = { ...assetData || {}, ...formattedAsset.data };
        formattedAsset.loadParser = loadParser ?? formattedAsset.loadParser;
        formattedAsset.format = format ?? formattedAsset.format ?? getUrlExtension(formattedAsset.src);

        return formattedAsset;
    }
}

export function getUrlExtension(url: string)
{
    return url.split('.').pop().split('?').shift()
        .split('#')
        .shift();
}
