import { convertToList } from '../utils/convertToList';
import { createStringVariations } from '../utils/createStringVariations';
import { isSingleItem } from '../utils/isSingleItem';
import { getBaseUrl, makeAbsoluteUrl } from '../utils/url/makeAbsoluteUrl';
import type { ResolveAsset, PreferOrder, ResolveURLParser, ResolverManifest, ResolverBundle } from './types';

/**
 * A class that is responsible for resolving mapping asset URLs to keys.
 * At its most basic it can be used for Aliases:
 *
 * ```
 * resolver.add('foo', 'bar');
 * resolver.resolveUrl('foo') // => 'bar'
 * ```
 *
 * It can also be used to resolve the most appropriate asset for a given URL:
 *
 * ```
 *  resolver.prefer({
 *      params:{
 *          format:'webp',
 *          resolution: 2,
 *      }
 *  })
 *
 *  resolver.add('foo', ['bar@2x.webp', 'bar@2x.png', 'bar.webp', 'bar.png']);
 *
 *  resolver.resolveUrl('foo') // => 'bar@2x.webp'
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
 * @memberof PIXI
 */
export class Resolver
{
    private _assetMap: Record<string, ResolveAsset[]> = {};
    private _preferredOrder: PreferOrder[] = [];
    private _parsers: ResolveURLParser[] = [];

    private _resolverHash: Record<string, ResolveAsset> = {};
    private _basePath: string;
    private _manifest: ResolverManifest;
    private _bundles: Record<string, string[]> = {};

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
     * Set the base path to append to all urls when resolving
     * @example
     * resolver.basePath = 'https://home.com/';
     * resolver.add('foo', 'bar.ong');
     * resolver.resolveUrl('foo', 'bar.png'); // => 'https://home.com/bar.png'
     * @param basePath - the base path to use
     */
    public set basePath(basePath: string)
    {
        this._basePath = getBaseUrl(basePath);
    }

    public get basePath(): string
    {
        return this._basePath;
    }

    /**
     * All the active URL parsers that help the parser to extract information and create
     * an asset object-based on parsing the URL itself.
     *
     * Can be added using the extensions API
     * @example
     * resolver.add('foo', [
     *    {
     *      resolution:2,
     *      format:'png'
     *      src: 'image@2x.png'
     *    },
     *    {
     *      resolution:1,
     *      format:'png'
     *      src: 'image.png'
     *    }
     * ]);
     *
     * // with a url parser the information such as resolution and file format could extracted from the url itself:
     * extensions.add({
     *     extension: ExtensionType.ResolveParser,
     *     test: loadTextures.test, // test if url ends in an image
     *     parse: (value: string) =>
     *     ({
     *         resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
     *         format: value.split('.').pop(),
     *         src: value,
     *     }),
     * });
     *
     * // now resolution and format can be extracted from the url
     * resolver.add('foo', [
     *    'image@2x.png'
     *    'image.png'
     * ]);
     * @
     */
    public get parsers(): ResolveURLParser[]
    {
        return this._parsers;
    }

    /** Used for testing, this resets the resolver to its initial state */
    public reset(): void
    {
        this._preferredOrder = [];

        this._resolverHash = {};
        this._assetMap = {};
        this._basePath = null;
        this._manifest = null;
    }

    /**
     * Add a manifest to the asset resolver. This is a nice way to add all the asset information in one go.
     * generally a manifest would be built using a tool.
     * @param manifest - the manifest to add to the resolver
     */
    public addManifest(manifest: ResolverManifest): void
    {
        if (this._manifest)
        {
            // #if _DEBUG
            console.warn('[Resolver] Manifest already exists, this will be overwritten');
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
     *  resolver.addBundle('animals', {
     *    bunny: 'bunny.png',
     *    chicken: 'chicken.png',
     *    thumper: 'thumper.png',
     *  });
     *
     * const resolvedAssets = await resolver.resolveBundle('animals');
     * @param bundleId - The id of the bundle to add
     * @param assets - A record of the asset or assets that will be chosen from when loading via the specified key
     */
    public addBundle(bundleId: string, assets: ResolverBundle['assets']): void
    {
        const assetNames: string[] = [];

        if (Array.isArray(assets))
        {
            assets.forEach((asset) =>
            {
                if (typeof asset.name === 'string')
                {
                    assetNames.push(asset.name);
                }
                else
                {
                    assetNames.push(...asset.name);
                }

                this.add(asset.name, asset.srcs);
            });
        }
        else
        {
            Object.keys(assets).forEach((key) =>
            {
                assetNames.push(key);
                this.add(key, assets[key]);
            });
        }

        this._bundles[bundleId] = assetNames;
    }

    /**
     * Tells the resolver what keys are associated with witch asset.
     * The most important thing the resolver does
     * @example
     * // single key, single asset:
     * resolver.add('foo', 'bar.png');
     * resolver.resolveUrl('foo') // => 'bar.png'
     *
     * // multiple keys, single asset:
     * resolver.add(['foo', 'boo'], 'bar.png');
     * resolver.resolveUrl('foo') // => 'bar.png'
     * resolver.resolveUrl('boo') // => 'bar.png'
     *
     * // multiple keys, multiple assets:
     * resolver.add(['foo', 'boo'], ['bar.png', 'bar.webp']);
     * resolver.resolveUrl('foo') // => 'bar.png'
     *
     * // add custom data attached to the resolver
     * Resolver.add(
     *     'bunnyBooBooSmooth',
     *     'bunny{png,webp}',
     *     {scaleMode:SCALE_MODES.NEAREST} // base texture options
     * );
     *
     * resolver.resolve('bunnyBooBooSmooth') // => {src: 'bunny.png', data: {scaleMode: SCALE_MODES.NEAREST}}
     * @param keysIn - The keys to map, can be an array or a single key
     * @param assetsIn - The assets to associate with the key(s)
     * @param data - The data that will be attached to the object that resolved object.
     */
    public add(keysIn: string | string[], assetsIn: string | ResolveAsset | (ResolveAsset | string)[], data?: unknown): void
    {
        const keys: string[] = convertToList<string>(keysIn);

        keys.forEach((key) =>
        {
            if (this._assetMap[key])
            {
                // #if _DEBUG
                console.warn(`[Resolver] already has key: ${key} overwriting`);
                // #endif
            }
        });

        if (!Array.isArray(assetsIn))
        {
            if (typeof assetsIn === 'string')
            {
                assetsIn = createStringVariations(assetsIn);
            }
            else
            {
                assetsIn = [assetsIn];
            }
        }

        const assetMap: ResolveAsset[] = assetsIn.map((asset): ResolveAsset =>
        {
            let formattedAsset = asset as ResolveAsset;

            // check if is a string
            if (typeof asset === 'string')
            {
                // first see if it contains any {} tags...

                let parsed = false;

                for (let i = 0; i < this._parsers.length; i++)
                {
                    const parser = this._parsers[i];

                    if (parser.test(asset))
                    {
                        formattedAsset = parser.parse(asset);
                        parsed = true;
                        break;
                    }
                }

                if (!parsed)
                {
                    formattedAsset = {
                        src: asset,
                    };
                }
            }

            if (!formattedAsset.format)
            {
                formattedAsset.format = formattedAsset.src.split('.').pop();
            }

            if (!formattedAsset.alias)
            {
                formattedAsset.alias = keys;
            }

            if (this._basePath)
            {
                formattedAsset.src = makeAbsoluteUrl(formattedAsset.src, this._basePath);
            }

            formattedAsset.data = formattedAsset.data ?? data;

            return formattedAsset;
        });

        keys.forEach((key) =>
        {
            this._assetMap[key] = assetMap;
        });
    }

    /**
     * If the resolver has had a manifest set via setManifest, this will return the assets urls for
     * a given bundleId or bundleIds.
     * @example
     * // manifest example
     * const manifest = {
     *   bundles:[{
     *      name:'load-screen',
     *      assets:[
     *          {
     *             name: 'background',
     *             srcs: 'sunset.png',
     *          },
     *          {
     *             name: 'bar',
     *             srcs: 'load-bar.{png,webp}',
     *          }
     *      ]
     *   },
     *   {
     *      name:'game-screen',
     *      assets:[
     *          {
     *             name: 'character',
     *             srcs: 'robot.png',
     *          },
     *          {
     *             name: 'enemy',
     *             srcs: 'bad-guy.png',
     *          }
     *      ]
     *   }]
     * }}
     * resolver.setManifest(manifest);
     * const resolved = resolver.resolveBundle('load-screen');
     * @param bundleIds - The bundle ids to resolve
     * @returns All the bundles assets or a hash of assets for each bundle specified
     */
    public resolveBundle(bundleIds: string | string[]):
    Record<string, ResolveAsset> | Record<string, Record<string, ResolveAsset>>
    {
        const singleAsset = isSingleItem(bundleIds);

        bundleIds = convertToList<string>(bundleIds);

        const out: Record<string, Record<string, ResolveAsset>> = {};

        bundleIds.forEach((bundleId) =>
        {
            const assetNames = this._bundles[bundleId];

            if (assetNames)
            {
                out[bundleId] = this.resolve(assetNames) as Record<string, ResolveAsset>;
            }
        });

        return singleAsset ? out[bundleIds[0]] : out;
    }

    /**
     * Does exactly what resolve does, but returns just the URL rather than the whole asset object
     * @param key - The key or keys to resolve
     * @returns - The URLs associated with the key(s)
     */
    public resolveUrl(key: string | string[]): string | Record<string, string>
    {
        const result = this.resolve(key);

        if (typeof key !== 'string')
        {
            const out: Record<string, string> = {};

            for (const i in result)
            {
                out[i] = (result as Record<string, ResolveAsset>)[i].src;
            }

            return out;
        }

        return (result as ResolveAsset).src;
    }

    /**
     * Resolves each key in the list to an asset object.
     * Another key function of the resolver! After adding all the various key/asset pairs. this will run the logic
     * of finding which asset to return based on any preferences set using the `prefer` function
     * by default the same key passed in will be returned if nothing is matched by the resolver.
     * @example
     * resolver.add('boo', 'bunny.png');
     *
     * resolver.resolve('boo') // => {src:'bunny.png'}
     *
     * // will return the same string as no key was added for this value..
     * resolver.resolve('another-thing.png') // => {src:'another-thing.png'}
     * @param keys - key or keys to resolve
     * @returns - the resolve asset or a hash of resolve assets for each key specified
     */
    public resolve(keys: string | string[]): ResolveAsset | Record<string, ResolveAsset>
    {
        const singleAsset = isSingleItem(keys);

        keys = convertToList<string>(keys);

        const result: Record<string, ResolveAsset> = {};

        keys.forEach((key) =>
        {
            if (!this._resolverHash[key])
            {
                if (this._assetMap[key])
                {
                    let assets = this._assetMap[key];

                    const preferredOrder = this._getPreferredOrder(assets);

                    const bestAsset = assets[0];

                    preferredOrder?.priority.forEach((priorityKey) =>
                    {
                        preferredOrder.params[priorityKey].forEach((value: unknown) =>
                        {
                            const filteredAssets = assets.filter((asset) =>
                            {
                                if (asset[priorityKey])
                                {
                                    return asset[priorityKey] === value;
                                }

                                return false;
                            });

                            if (filteredAssets.length)
                            {
                                assets = filteredAssets;
                            }
                        });
                    });

                    this._resolverHash[key] = (assets[0] ?? bestAsset);
                }
                else
                {
                    let src = key;

                    if (this._basePath)
                    {
                        src = makeAbsoluteUrl(src, this._basePath);
                    }

                    // if the resolver fails we just pass back the key assuming its a url
                    this._resolverHash[key] = {
                        src,
                    };
                }
            }

            result[key] = this._resolverHash[key];
        });

        return singleAsset ? result[keys[0]] : result;
    }

    /**
     * Internal function for figuring out what prefer criteria an asset should use.
     * @param assets
     */
    private _getPreferredOrder(assets: ResolveAsset[]): PreferOrder
    {
        for (let i = 0; i < assets.length; i++)
        {
            const asset = assets[0];

            const preferred =  this._preferredOrder.find((preference: PreferOrder) =>
                preference.params.format.includes(asset.format));

            if (preferred)
            {
                return preferred;
            }
        }

        return this._preferredOrder[0];
    }
}
