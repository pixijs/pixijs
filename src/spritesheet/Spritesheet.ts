import { Rectangle } from '../maths/shapes/Rectangle';
import { Texture } from '../rendering/renderers/shared/texture/Texture';

import type { PointData } from '../maths/PointData';
import type { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import type { BindableTexture } from '../rendering/renderers/shared/texture/Texture';
import type { Dict } from '../utils/types';

/**
 * Represents the JSON data for a spritesheet atlas.
 * @memberof PIXI
 */
export interface SpritesheetFrameData
{
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
    anchor?: PointData;
    // borders?: ITextureBorders;
}

/**
 * Atlas format.
 * @memberof PIXI
 */
export interface SpritesheetData
{
    frames: Dict<SpritesheetFrameData>;
    animations?: Dict<string[]>;
    meta: {
        scale: string;
        // eslint-disable-next-line camelcase
        related_multi_packs?: string[];
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
export class Spritesheet
{
    /** The maximum number of Textures to build per process. */
    static readonly BATCH_SIZE = 1000;

    /** For multi-packed spritesheets, this contains a reference to all the other spritesheets it depends on. */
    public linkedSheets: Spritesheet[] = [];

    /** Reference to ths source texture. */
    public textureSource: TextureSource;

    /**
     * A map containing all textures of the sprite sheet.
     * Can be used to create a {@link PIXI.Sprite|Sprite}:
     * @example
     * import { Sprite } from 'pixi.js';
     *
     * new Sprite(sheet.textures['image.png']);
     */
    public textures: Dict<Texture>;

    /**
     * A map containing the textures for each animation.
     * Can be used to create an {@link PIXI.AnimatedSprite|AnimatedSprite}:
     * @example
     * import { AnimatedSprite } from 'pixi.js';
     *
     * new AnimatedSprite(sheet.animations['anim_name']);
     */
    public animations: Dict<Texture[]>;

    /**
     * Reference to the original JSON data.
     * @type {object}
     */
    public data: SpritesheetData;

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
    private _frames: Dict<SpritesheetFrameData>;

    /** Collection of frame names. */
    private _frameKeys: string[];

    /** Current batch index being processed. */
    private _batchIndex: number;

    /**
     * Callback when parse is completed.
     * @type {Function}
     */
    private _callback: (textures: Dict<Texture>) => void;

    /**
     * @param texture - Reference to the source BaseTexture object.
     * @param {object} data - Spritesheet image data.
     */
    constructor(texture: BindableTexture, data: SpritesheetData)
    {
        this._texture = texture instanceof Texture ? texture : null;
        this.textureSource = texture.source;
        this.textures = {};
        this.animations = {};
        this.data = data;

        const metaResolution = parseFloat(data.meta.scale);

        if (metaResolution)
        {
            this.resolution = metaResolution;
            texture.source.resolution = this.resolution;
        }
        else
        {
            this.resolution = texture.source._resolution;
        }

        this._frames = this.data.frames;
        this._frameKeys = Object.keys(this._frames);
        this._batchIndex = 0;
        this._callback = null;
    }

    /**
     * Parser spritesheet from loaded data. This is done asynchronously
     * to prevent creating too many Texture within a single process.
     * @method PIXI.Spritesheet#parse
     */
    public parse(): Promise<Record<string, Texture>>
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

                    trim.x /= this.textureSource.width;
                    trim.y /= this.textureSource.height;
                    trim.width /= this.textureSource.width;
                    trim.height /= this.textureSource.height;
                }

                // normalise...
                frame.x /= this.textureSource.width;
                frame.y /= this.textureSource.height;
                frame.width /= this.textureSource.width;
                frame.height /= this.textureSource.height;

                orig.x /= this.textureSource.width;
                orig.y /= this.textureSource.height;
                orig.width /= this.textureSource.width;
                orig.height /= this.textureSource.height;

                this.textures[i] = new Texture({
                    source: this.textureSource,
                    layout: {
                        frame,
                        orig,
                        trim,
                        rotate: data.rotated ? 2 : 0,
                        defaultAnchor: data.anchor
                        // TODO - add data.borders
                    },
                    label: i,
                });
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
            this.animations[animName] = [];
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
            this.textureSource.destroy();
        }
        this._texture = null;
        this.textureSource = null;
        this.linkedSheets = [];
    }
}
