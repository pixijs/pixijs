import { BaseTexture, Rectangle, Texture, utils } from '@pixi/core';

import type { ImageResource, IPointData, ITextureBorders } from '@pixi/core';

/**
 * Represents the JSON data for a spritesheet atlas.
 * @memberof PIXI
 */
export interface ISpritesheetFrameData
{
    frame: {
        h: number;
        w: number;
        x: number;
        y: number;
    };
    trimmed?: boolean;
    rotated?: boolean;
    sourceSize?: {
        h: number;
        w: number;
    };
    spriteSourceSize?: {
        h?: number;
        w?: number;
        x: number;
        y: number;
    };
    anchor?: IPointData;
    borders?: ITextureBorders;
}

/**
 * Atlas format.
 * @memberof PIXI
 */
export interface ISpritesheetData
{
    animations?: utils.Dict<string[]>;
    frames: utils.Dict<ISpritesheetFrameData>;
    meta: {
        app?: string;
        format?: string;
        frameTags?: {
            from: number;
            name: string;
            to: number;
            direction: string;
        }[];
        image?: string;
        layers?: {
            blendMode: string;
            name: string;
            opacity: number;
        }[];
        scale: string | number;
        size?: {
            h: number;
            w: number;
        };
        slices?: {
            color: string;
            name: string;
            keys: {
                frame: number,
                bounds: {
                    x: number;
                    y: number;
                    w: number;
                    h: number;
                };
            }[];
        }[];
        // eslint-disable-next-line camelcase
        related_multi_packs?: string[];
        version?: string;
    };
}

/**
 * Utility class for maintaining reference to a collection
 * of Textures on a single Spritesheet.
 *
 * To access a sprite sheet from your code you may pass its JSON data file to Pixi's loader:
 *
 * ```js
 * import { Assets } from 'pixi.js';
 *
 * const sheet = await Assets.load('images/spritesheet.json');
 * ```
 *
 * Alternately, you may circumvent the loader by instantiating the Spritesheet directly:
 *
 * ```js
 * import { Spritesheet } from 'pixi.js';
 *
 * const sheet = new Spritesheet(texture, spritesheetData);
 * await sheet.parse();
 * console.log('Spritesheet ready to use!');
 * ```
 *
 * With the `sheet.textures` you can create Sprite objects, and `sheet.animations` can be used to create an AnimatedSprite.
 *
 * Here's an example of a sprite sheet JSON data file:
 * ```json
 * {
 *     "frames": {
 *         "enemy1.png":
 *         {
 *             "frame": {"x":103,"y":1,"w":32,"h":32},
 *             "spriteSourceSize": {"x":0,"y":0,"w":32,"h":32},
 *             "sourceSize": {"w":32,"h":32},
 *             "anchor": {"x":16,"y":16}
 *         },
 *         "enemy2.png":
 *         {
 *             "frame": {"x":103,"y":35,"w":32,"h":32},
 *             "spriteSourceSize": {"x":0,"y":0,"w":32,"h":32},
 *             "sourceSize": {"w":32,"h":32},
 *             "anchor": {"x":16,"y":16}
 *         },
 *         "button.png":
 *         {
 *             "frame": {"x":1,"y":1,"w":100,"h":100},
 *             "spriteSourceSize": {"x":0,"y":0,"w":100,"h":100},
 *             "sourceSize": {"w":100,"h":100},
 *             "anchor": {"x":0,"y":0},
 *             "borders": {"left":35,"top":35,"right":35,"bottom":35}
 *         }
 *     },
 *
 *     "animations": {
 *         "enemy": ["enemy1.png","enemy2.png"]
 *     },
 *
 *     "meta": {
 *         "image": "sheet.png",
 *         "format": "RGBA8888",
 *         "size": {"w":136,"h":102},
 *         "scale": "1"
 *     }
 * }
 * ```
 * Sprite sheets can be packed using tools like {@link https://codeandweb.com/texturepacker|TexturePacker},
 * {@link https://renderhjs.net/shoebox/|Shoebox} or {@link https://github.com/krzysztof-o/spritesheet.js|Spritesheet.js}.
 * Default anchor points (see {@link PIXI.Texture#defaultAnchor}), default 9-slice borders
 * (see {@link PIXI.Texture#defaultBorders}) and grouping of animation sprites are currently only
 * supported by TexturePacker.
 * @memberof PIXI
 */
export class Spritesheet<S extends ISpritesheetData = ISpritesheetData>
{
    /** The maximum number of Textures to build per process. */
    static readonly BATCH_SIZE = 1000;

    /** For multi-packed spritesheets, this contains a reference to all the other spritesheets it depends on. */
    public linkedSheets: Spritesheet<S>[] = [];

    /** Reference to ths source texture. */
    public baseTexture: BaseTexture;

    /**
     * A map containing all textures of the sprite sheet.
     * Can be used to create a {@link PIXI.Sprite|Sprite}:
     * @example
     * import { Sprite } from 'pixi.js';
     *
     * new Sprite(sheet.textures['image.png']);
     */
    public textures: Record<keyof S['frames'], Texture>;

    /**
     * A map containing the textures for each animation.
     * Can be used to create an {@link PIXI.AnimatedSprite|AnimatedSprite}:
     * @example
     * import { AnimatedSprite } from 'pixi.js';
     *
     * new AnimatedSprite(sheet.animations['anim_name']);
     */
    public animations: Record<keyof NonNullable<S['animations']>, Texture[]>;

    /**
     * Reference to the original JSON data.
     * @type {object}
     */
    public data: S;

    /** The resolution of the spritesheet. */
    public resolution: number;

    /**
     * Reference to original source image from the Loader. This reference is retained so we
     * can destroy the Texture later on. It is never used internally.
     */
    private _texture: Texture;

    /**
     * Map of spritesheet frames.
     * @type {object}
     */
    private _frames: S['frames'];

    /** Collection of frame names. */
    private _frameKeys: (keyof S['frames'])[];

    /** Current batch index being processed. */
    private _batchIndex: number;

    /**
     * Callback when parse is completed.
     * @type {Function}
     */
    private _callback: (textures: utils.Dict<Texture>) => void;

    /**
     * @param texture - Reference to the source BaseTexture object.
     * @param {object} data - Spritesheet image data.
     * @param resolutionFilename - The filename to consider when determining
     *        the resolution of the spritesheet. If not provided, the imageUrl will
     *        be used on the BaseTexture.
     */
    constructor(texture: BaseTexture | Texture, data: S, resolutionFilename: string = null)
    {
        this._texture = texture instanceof Texture ? texture : null;
        this.baseTexture = texture instanceof BaseTexture ? texture : this._texture.baseTexture;
        this.textures = {} as Record<keyof S['frames'], Texture>;
        this.animations = {} as Record<keyof NonNullable<S['animations']>, Texture[]>;
        this.data = data;

        const resource = this.baseTexture.resource as ImageResource;

        this.resolution = this._updateResolution(resolutionFilename || (resource ? resource.url : null));
        this._frames = this.data.frames;
        this._frameKeys = Object.keys(this._frames);
        this._batchIndex = 0;
        this._callback = null;
    }

    /**
     * Generate the resolution from the filename or fallback
     * to the meta.scale field of the JSON data.
     * @param resolutionFilename - The filename to use for resolving
     *        the default resolution.
     * @returns Resolution to use for spritesheet.
     */
    private _updateResolution(resolutionFilename: string = null): number
    {
        const { scale } = this.data.meta;

        // Use a defaultValue of `null` to check if a url-based resolution is set
        let resolution = utils.getResolutionOfUrl(resolutionFilename, null);

        // No resolution found via URL
        if (resolution === null)
        {
            // Use the scale value or default to 1
            resolution = typeof scale === 'number' ? scale : parseFloat(scale ?? '1');
        }

        // For non-1 resolutions, update baseTexture
        if (resolution !== 1)
        {
            this.baseTexture.setResolution(resolution);
        }

        return resolution;
    }

    /**
     * Parser spritesheet from loaded data. This is done asynchronously
     * to prevent creating too many Texture within a single process.
     * @method PIXI.Spritesheet#parse
     */
    public parse(): Promise<utils.Dict<Texture>>
    {
        return new Promise((resolve) =>
        {
            this._callback = resolve;
            this._batchIndex = 0;

            if (this._frameKeys.length <= Spritesheet.BATCH_SIZE)
            {
                this._processFrames(0);
                this._processAnimations();
                this._parseComplete();
            }
            else
            {
                this._nextBatch();
            }
        });
    }

    /**
     * Process a batch of frames
     * @param initialFrameIndex - The index of frame to start.
     */
    private _processFrames(initialFrameIndex: number): void
    {
        let frameIndex = initialFrameIndex;
        const maxFrames = Spritesheet.BATCH_SIZE;

        while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length)
        {
            const i = this._frameKeys[frameIndex];
            const data = this._frames[i];
            const rect = data.frame;

            if (rect)
            {
                let frame = null;
                let trim = null;
                const sourceSize = data.trimmed !== false && data.sourceSize
                    ? data.sourceSize : data.frame;

                const orig = new Rectangle(
                    0,
                    0,
                    Math.floor(sourceSize.w) / this.resolution,
                    Math.floor(sourceSize.h) / this.resolution
                );

                if (data.rotated)
                {
                    frame = new Rectangle(
                        Math.floor(rect.x) / this.resolution,
                        Math.floor(rect.y) / this.resolution,
                        Math.floor(rect.h) / this.resolution,
                        Math.floor(rect.w) / this.resolution
                    );
                }
                else
                {
                    frame = new Rectangle(
                        Math.floor(rect.x) / this.resolution,
                        Math.floor(rect.y) / this.resolution,
                        Math.floor(rect.w) / this.resolution,
                        Math.floor(rect.h) / this.resolution
                    );
                }

                //  Check to see if the sprite is trimmed
                if (data.trimmed !== false && data.spriteSourceSize)
                {
                    trim = new Rectangle(
                        Math.floor(data.spriteSourceSize.x) / this.resolution,
                        Math.floor(data.spriteSourceSize.y) / this.resolution,
                        Math.floor(rect.w) / this.resolution,
                        Math.floor(rect.h) / this.resolution
                    );
                }

                this.textures[i] = new Texture(
                    this.baseTexture,
                    frame,
                    orig,
                    trim,
                    data.rotated ? 2 : 0,
                    data.anchor,
                    data.borders
                );

                // lets also add the frame to pixi's global cache for 'from' and 'fromLoader' functions
                Texture.addToCache(this.textures[i], i.toString());
            }

            frameIndex++;
        }
    }

    /** Parse animations config. */
    private _processAnimations(): void
    {
        const animations = this.data.animations || {};

        for (const animName in animations)
        {
            this.animations[animName as keyof S['animations']] = [];
            for (let i = 0; i < animations[animName].length; i++)
            {
                const frameName = animations[animName][i];

                this.animations[animName].push(this.textures[frameName]);
            }
        }
    }

    /** The parse has completed. */
    private _parseComplete(): void
    {
        const callback = this._callback;

        this._callback = null;
        this._batchIndex = 0;
        callback.call(this, this.textures);
    }

    /** Begin the next batch of textures. */
    private _nextBatch(): void
    {
        this._processFrames(this._batchIndex * Spritesheet.BATCH_SIZE);
        this._batchIndex++;
        setTimeout(() =>
        {
            if (this._batchIndex * Spritesheet.BATCH_SIZE < this._frameKeys.length)
            {
                this._nextBatch();
            }
            else
            {
                this._processAnimations();
                this._parseComplete();
            }
        }, 0);
    }

    /**
     * Destroy Spritesheet and don't use after this.
     * @param {boolean} [destroyBase=false] - Whether to destroy the base texture as well
     */
    public destroy(destroyBase = false): void
    {
        for (const i in this.textures)
        {
            this.textures[i].destroy();
        }
        this._frames = null;
        this._frameKeys = null;
        this.data = null;
        this.textures = null;
        if (destroyBase)
        {
            this._texture?.destroy();
            this.baseTexture.destroy();
        }
        this._texture = null;
        this.baseTexture = null;
        this.linkedSheets = [];
    }
}
