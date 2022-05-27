import { createStringVariations } from '../utils/createStringVariations';
import { getBaseUrl, makeAbsoluteUrl } from '../utils/makeAbsoluteUrl';

/**
 * a prefer order lets the resolver know which assets to prefere depending on the various
 * parameters passed to it.
 */
export interface PreferOrder
{
    /** the importance order of the params */
    priority?: string[];
    // TODO @bigtimebuddy -need a better name than prepare..
    params: {
        [key: string]: any;
    };
}

/**
 * the object returned when a key is resolved to an asset.
 * it will contain any additional information passed in the asset was added.
 */
export interface ResolveAsset extends Record<string, any>
{
    alias?: string[];
    src: string;
}

/** structure of a bundle found in a manfest file */
export interface ResolverBundle
{
    name: string;
    assets: {
        // TODO @bigtimebuddy - perhaps rename this to alias?.
        name: string | string[];
        // TODO @bigtimebuddy - need somthing better than this..
        srcs: string | ResolveAsset[];
    }[];
}

/** the expected format of a manifest. This would normally be auto generated ar made by the developer */
export type ResolverManifest = {
    // room for more props as we go!
    bundles: ResolverBundle[];
};

/**
 * format for url parser, will test a string and if it pass
 * will then parse it, turning it into an ResolveAsset
 */
export interface ResolveURLParser
{
    /** the test to perform on the url to determin if it should be parsed */
    test: (url: string) => boolean;
    /** the function that will convert the url into an object */
    parse: (value: string) => ResolveAsset;
}

/**
 * A class that is responsible for resolving mapping asset urls to keys.
 * At its most basic is can be used for Aliases:
 *
 * ```
 * resolver.add('foo`, 'bar`);
 * resolver.resolveUrl('foo`) // => 'bar`
 * ```
 *
 * It can also be used to resolve the most appropriate asset for a given url:
 *
 * ```
 *  resolver.prefer({
 *      params:{
 *          format:'webp',
 *          resolution: 2,
 *      }
 *  })
 *
 *  resolver.add('foo`, ['bar@2x.webp', 'bar@2x.png', 'bar.webp', 'bar.png']);
 *
 *  resolver.resolveUrl('foo`) // => 'bar@2x.webp`
 * ```
 * Other features include:
 * - ability to process a manifest file to get the correct understanding of how to resolve all assets
 * - ability to add custom parsers for specific file types
 * - ability to add custom prefer rules
 *
 * This class only cares about the url, not the loading of the asset itself.
 *
 * It is not intended that this class is created by developers - its part of the Asset class
 * This is the third major system of PixiJS' main Assets class
 */
export class Resolver
{
    private _assetMap: Record<string, ResolveAsset[]> = {};
    private _preferredOrder: PreferOrder[] = [];

    private _parsers: ResolveURLParser[] = [];

    private _resolverHash: Record<string, {src: string}> = {};
    private _basePath: string;
    private _manifest: ResolverManifest;

    /**
     * let the resolver know which assets you prefer to use when resolving assets
     *
     * example:
     * ```
     *  resolver.prefer({
     *      // first look for something with the correct format, and then then correct resolution
     *      priority: ['format', 'resolution`],
     *      params:{
     *          format:'webp', // prefer webp images
     *          resolution: 2, // prefer a resolution of 2
     *      }
     *  })
     *
     *  resolver.add('foo`, ['bar@2x.webp', 'bar@2x.png', 'bar.webp', 'bar.png']);
     *
     *  resolver.resolveUrl('foo`) // => 'bar@2x.webp`
     * ```
     *
     * Multiple prefer user defined rules can be added.
     *
     * @param prefer - the prefer options
     */
    public prefer(prefer: PreferOrder): void
    {
        this._preferredOrder.push(prefer);

        if (!prefer.priority)
        {
            // generate the priority based on the order of the object
            prefer.priority = Object.keys(prefer.params);
        }

        this._resolverHash = {};
    }

    /** set the base path to append to all urls when resolving
     *
     * example:
     * ```
     *  resolver.basePath = 'https://home.com/';
     *
     *  resolver.add('foo`, 'bar.ong`);
     *
     *  resolver.resolveUrl('foo`, 'bar.png`); // => 'https://home.com/bar.png`
     * ```
     */
    public set basePath(basePath: string)
    {
        this._basePath = getBaseUrl(basePath);
    }

    public get basePath(): string
    {
        return this._basePath;
    }

    /** used for testing, this resets the resolver to its initial state */
    public reset(): void
    {
        this._parsers = [];
        this._preferredOrder = [];

        this._resolverHash = {};
        this._assetMap = {};
        this._basePath = null;
        this._manifest = null;
    }

    /**
     * A url parser helps the parser to extract information and create an asset object based on parsing the url itself.
     *
     * example:
     *
     * ```
     *
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
     *
     * // with a url parser the information such as resolution and file format could extracted from the url itself:
     *
     * resolver.addUrlParser({
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
     *
     * ```
     *
     * @param parser - the url parser that you want to add to the resolver
     *
     */
    public addUrlParser(parser: ResolveURLParser): void
    {
        if (this._parsers.includes(parser)) return;

        this._parsers.push(parser);
    }

    /**
     * Add a manifest to the asset resolver. This is a nice way to add all the asset information in one go.
     * generally a manifest would be built using a tool.
     *
     * @param manifest - the manifest to add to the resolver
     */
    public addManifest(manifest: ResolverManifest): void
    {
        if (this._manifest)
        {
            console.warn('[Resolver] Manifest already exists, this will be overwritten');
        }

        this._manifest = manifest;

        manifest.bundles.forEach((bundle) =>
        {
            bundle.assets.forEach((asset) =>
            {
                this.add(asset.name, asset.srcs);
            });
        });
    }

    /**
     * The most important thing the resolver does. this function will tell the resolver
     * what keys are associated with witch asset.
     *
     * example:
     *
     * ```
     * // single key, single asset:
     *
     * resolver.add('foo', 'bar.png');
     * resolver.resolveUrl('foo') // => 'bar.png'
     *
     * // multiple keys, single asset:
     *
     * resolver.add(['foo', 'boo'], 'bar.png');
     * resolver.resolveUrl('foo') // => 'bar.png'
     * resolver.resolveUrl('boo') // => 'bar.png'
     *
     * // multiple keys, multiple assets:
     *
     * resolver.add(['foo', 'boo'], ['bar.png', 'bar.webp']);
     * resolver.resolveUrl('foo') // => 'bar.png'
     *
     * ```
     *
     * @param keys - the keys to map, can be an array or a single key
     * @param assets - the assets to associate with the key(s)
     */
    public add(keysIn: string | string[], assetsIn: string | (ResolveAsset | string)[]): void
    {
        const keys: string[] = (typeof keysIn === 'string') ? [keysIn] : keysIn;

        keys.forEach((key) =>
        {
            if (this._assetMap[key])
            {
                console.warn(`[Resolver] already has key: ${key} overwriting`);
            }
        });

        const assets =  (typeof assetsIn === 'string') ? createStringVariations(assetsIn) : assetsIn;

        const assetMap: ResolveAsset[] = assets.map((asset): ResolveAsset =>
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
     *
     * @example
     *
     * ```
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
     *
     * resolver.setManifest(manifest);
     *
     * const resolved = resolver.resolveBundle('load-screen');
     *
     * ```
     *
     * @param bundleIds - the bundle ids to resolve
     * @returns all the bundles assets or a hash of assets for each bundle specified
     */
    public resolveBundle(bundleIds: string | string[]):
    Record<string, ResolveAsset[]> | Record<string, Record<string, ResolveAsset[]>>
    {
        let singleAsset = false;

        if (typeof bundleIds === 'string')
        {
            singleAsset = true;
            bundleIds = [bundleIds];
        }

        const out: Record<string, Record<string, ResolveAsset[]>> = {};

        this._manifest.bundles.filter((bundle) => bundleIds.includes(bundle.name))
            .forEach((bundle) =>
            {
                const assetNames: string[] = [];

                bundle.assets.forEach((asset) =>
                {
                    if (typeof asset.name === 'string')
                    {
                        assetNames.push(asset.name);
                    }
                    else
                    {
                        assetNames.push(...asset.name);
                    }
                });

                out[bundle.name] = this.resolve(assetNames) as Record<string, ResolveAsset[]>;
            });

        return singleAsset ? out[bundleIds[0]] : out;
    }

    /**
     * Does exactly what resolve does, but returns just the url rather than the whole asset object
     *
     * @param key - the key or keys to resolve
     * @returns - the urls associate with the key(s)
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
     * Another key function of the resolver! To.. resolve!
     * avder adding all the various key/asset pairs. this will run the logic
     * of finding which asset to return based on any preferences set using the `prefer` function
     * by default the same key passed in will be returned if nothing is matched by the resolver.
     *
     * @example
     * ```
     * resolver.add('boo', 'bunny.png');
     *
     * resolver.resolve('boo') // => {src:'bunny.png'}
     *
     * // will return the same string as no key was added for this value..
     * resolver.resolve('another-thing.png') // => {src:'another-thing.png'}
     *
     * ```
     * @param keys - key or keys to resolve
     * @returns - the resolve asset or a hash of resolve assets for each key specified
     */
    public resolve(keys: string | string[]): ResolveAsset | Record<string, ResolveAsset>
    {
        let singleAsset = false;

        if (typeof keys === 'string')
        {
            singleAsset = true;
            keys = [keys];
        }

        const result: Record<string, {src: string}> = {};

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

    /** internal function for figuring out what prefer criteria an asset should use. */
    private _getPreferredOrder(assets: ResolveAsset[]): PreferOrder
    {
        const asset = assets[0];

        // if(Object.key(asset))
        const preferred =  this._preferredOrder.find((preference: PreferOrder) =>
            preference.params.format.includes(asset.format)) ?? this._preferredOrder[0];

        return preferred;
    }
}
