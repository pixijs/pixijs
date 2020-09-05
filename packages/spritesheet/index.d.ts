import { BaseTexture } from '@pixi/core';
import type { Dict } from '@pixi/utils';
import type { ILoaderResource } from '@pixi/loaders';
import type { IPointData } from '@pixi/math';
import { Texture } from '@pixi/core';

/**
 * Atlas format.
 */
export declare interface ISpritesheetData {
    frames: Dict<ISpritesheetFrameData>;
    animations?: Dict<string[]>;
    meta: {
        scale: string;
    };
}

/**
 * Represents the JSON data for a spritesheet atlas.
 */
export declare interface ISpritesheetFrameData {
    frame: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    trimmed?: boolean;
    rotated?: boolean;
    sourceSize?: {
        w: number;
        h: number;
    };
    spriteSourceSize?: {
        x: number;
        y: number;
    };
    anchor?: IPointData;
}

/**
 * Utility class for maintaining reference to a collection
 * of Textures on a single Spritesheet.
 *
 * To access a sprite sheet from your code pass its JSON data file to Pixi's loader:
 *
 * ```js
 * PIXI.Loader.shared.add("images/spritesheet.json").load(setup);
 *
 * function setup() {
 *   let sheet = PIXI.Loader.shared.resources["images/spritesheet.json"].spritesheet;
 *   ...
 * }
 * ```
 * With the `sheet.textures` you can create Sprite objects,`sheet.animations` can be used to create an AnimatedSprite.
 *
 * Sprite sheets can be packed using tools like {@link https://codeandweb.com/texturepacker|TexturePacker},
 * {@link https://renderhjs.net/shoebox/|Shoebox} or {@link https://github.com/krzysztof-o/spritesheet.js|Spritesheet.js}.
 * Default anchor points (see {@link PIXI.Texture#defaultAnchor}) and grouping of animation sprites are currently only
 * supported by TexturePacker.
 *
 * @class
 * @memberof PIXI
 */
export declare class Spritesheet {
    /**
     * The maximum number of Textures to build per process.
     *
     * @type {number}
     * @default 1000
     */
    static readonly BATCH_SIZE = 1000;
    baseTexture: BaseTexture;
    textures: Dict<Texture>;
    animations: Dict<Texture[]>;
    data: ISpritesheetData;
    resolution: number;
    private _texture;
    private _frames;
    private _frameKeys;
    private _batchIndex;
    private _callback;
    /**
     * @param {PIXI.BaseTexture|PIXI.Texture} baseTexture - Reference to the source BaseTexture object.
     * @param {Object} data - Spritesheet image data.
     * @param {string} [resolutionFilename] - The filename to consider when determining
     *        the resolution of the spritesheet. If not provided, the imageUrl will
     *        be used on the BaseTexture.
     */
    constructor(texture: BaseTexture | Texture, data: ISpritesheetData, resolutionFilename?: string);
    /**
     * Generate the resolution from the filename or fallback
     * to the meta.scale field of the JSON data.
     *
     * @private
     * @param {string} resolutionFilename - The filename to use for resolving
     *        the default resolution.
     * @return {number} Resolution to use for spritesheet.
     */
    private _updateResolution;
    /**
     * Parser spritesheet from loaded data. This is done asynchronously
     * to prevent creating too many Texture within a single process.
     *
     * @param {Function} callback - Callback when complete returns
     *        a map of the Textures for this spritesheet.
     */
    parse(callback: () => void): void;
    /**
     * Process a batch of frames
     *
     * @private
     * @param {number} initialFrameIndex - The index of frame to start.
     */
    private _processFrames;
    /**
     * Parse animations config
     *
     * @private
     */
    private _processAnimations;
    /**
     * The parse has completed.
     *
     * @private
     */
    private _parseComplete;
    /**
     * Begin the next batch of textures.
     *
     * @private
     */
    private _nextBatch;
    /**
     * Destroy Spritesheet and don't use after this.
     *
     * @param {boolean} [destroyBase=false] - Whether to destroy the base texture as well
     */
    destroy(destroyBase?: boolean): void;
}

/**
 * {@link PIXI.Loader} middleware for loading texture atlases that have been created with
 * TexturePacker or similar JSON-based spritesheet.
 *
 * This middleware automatically generates Texture resources.
 *
 * If you're using Webpack or other bundlers and plan on bundling the atlas' JSON,
 * use the {@link PIXI.Spritesheet} class to directly parse the JSON.
 *
 * The Loader's image Resource name is automatically appended with `"_image"`.
 * If a Resource with this name is already loaded, the Loader will skip parsing the
 * Spritesheet. The code below will generate an internal Loader Resource called `"myatlas_image"`.
 *
 * @example
 * loader.add('myatlas', 'path/to/myatlas.json');
 * loader.load(() => {
 *   loader.resources.myatlas; // atlas JSON resource
 *   loader.resources.myatlas_image; // atlas Image resource
 * });
 *
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export declare class SpritesheetLoader {
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(resource: ILoaderResource, next: (...args: unknown[]) => void): void;
    /**
     * Get the spritesheets root path
     * @param {PIXI.LoaderResource} resource - Resource to check path
     * @param {string} baseUrl - Base root url
     */
    static getResourcePath(resource: ILoaderResource, baseUrl: string): string;
}

export { }
