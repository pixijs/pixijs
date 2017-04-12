import { Rectangle, Texture } from '../';
import { getResolutionOfUrl } from '../utils';

/**
 * Utility class for maintaining reference to a collection
 * of Textures on a single Spritesheet.
 *
 * @class
 * @memberof PIXI
 */
export default class Spritesheet
{
    /**
     * The maximum number of Textures to build per process.
     *
     * @type {number}
     * @default 1000
     */
    static get BATCH_SIZE()
    {
        return 1000;
    }

    /**
     * @param {PIXI.BaseTexture} baseTexture Reference to the source BaseTexture object.
     * @param {Object} data - Spritesheet image data.
     * @param {string} [resolutionFilename] - The filename to consider when determining
     *        the resolution of the spritesheet. If not provided, the imageUrl will
     *        be used on the BaseTexture.
     */
    constructor(baseTexture, data, resolutionFilename = null)
    {
        /**
         * Reference to ths source texture
         * @type {PIXI.BaseTexture}
         */
        this.baseTexture = baseTexture;

        /**
         * Map of spritesheet textures.
         * @type {Object}
         */
        this.textures = {};

        /**
         * Reference to the original JSON data.
         * @type {Object}
         */
        this.data = data;

        /**
         * The resolution of the spritesheet.
         * @type {number}
         */
        this.resolution = this._updateResolution(
            resolutionFilename || this.baseTexture.imageUrl
        );

        /**
         * Map of spritesheet frames.
         * @type {Object}
         * @private
         */
        this._frames = this.data.frames;

        /**
         * Collection of frame names.
         * @type {string[]}
         * @private
         */
        this._frameKeys = Object.keys(this._frames);

        /**
         * Current batch index being processed.
         * @type {number}
         * @private
         */
        this._batchIndex = 0;

        /**
         * Callback when parse is completed.
         * @type {Function}
         * @private
         */
        this._callback = null;
    }

    /**
     * Generate the resolution from the filename or fallback
     * to the meta.scale field of the JSON data.
     *
     * @private
     * @param {string} resolutionFilename - The filename to use for resolving
     *        the default resolution.
     * @return {number} Resolution to use for spritesheet.
     */
    _updateResolution(resolutionFilename)
    {
        const scale = this.data.meta.scale;

        // Use a defaultValue of `null` to check if a url-based resolution is set
        let resolution = getResolutionOfUrl(resolutionFilename, null);

        // No resolution found via URL
        if (resolution === null)
        {
            // Use the scale value or default to 1
            resolution = scale !== undefined ? parseFloat(scale) : 1;
        }

        // For non-1 resolutions, update baseTexture
        if (resolution !== 1)
        {
            this.baseTexture.resolution = resolution;
            this.baseTexture.update();
        }

        return resolution;
    }

    /**
     * Parser spritesheet from loaded data. This is done asynchronously
     * to prevent creating too many Texture within a single process.
     *
     * @param {Function} callback - Callback when complete returns
     *        a map of the Textures for this spritesheet.
     */
    parse(callback)
    {
        this._batchIndex = 0;
        this._callback = callback;

        if (this._frameKeys.length <= Spritesheet.BATCH_SIZE)
        {
            this._processFrames(0);
            this._parseComplete();
        }
        else
        {
            this._nextBatch();
        }
    }

    /**
     * Process a batch of frames
     *
     * @private
     * @param {number} initialFrameIndex - The index of frame to start.
     */
    _processFrames(initialFrameIndex)
    {
        let frameIndex = initialFrameIndex;
        const maxFrames = Spritesheet.BATCH_SIZE;

        while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length)
        {
            const i = this._frameKeys[frameIndex];
            const rect = this._frames[i].frame;

            if (rect)
            {
                let frame = null;
                let trim = null;
                const orig = new Rectangle(
                    0,
                    0,
                    this._frames[i].sourceSize.w / this.resolution,
                    this._frames[i].sourceSize.h / this.resolution
                );

                if (this._frames[i].rotated)
                {
                    frame = new Rectangle(
                        rect.x / this.resolution,
                        rect.y / this.resolution,
                        rect.h / this.resolution,
                        rect.w / this.resolution
                    );
                }
                else
                {
                    frame = new Rectangle(
                        rect.x / this.resolution,
                        rect.y / this.resolution,
                        rect.w / this.resolution,
                        rect.h / this.resolution
                    );
                }

                //  Check to see if the sprite is trimmed
                if (this._frames[i].trimmed)
                {
                    trim = new Rectangle(
                        this._frames[i].spriteSourceSize.x / this.resolution,
                        this._frames[i].spriteSourceSize.y / this.resolution,
                        rect.w / this.resolution,
                        rect.h / this.resolution
                    );
                }

                this.textures[i] = new Texture(
                    this.baseTexture,
                    frame,
                    orig,
                    trim,
                    this._frames[i].rotated ? 2 : 0
                );

                // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                Texture.addToCache(this.textures[i], i);
            }

            frameIndex++;
        }
    }

    /**
     * The parse has completed.
     *
     * @private
     */
    _parseComplete()
    {
        const callback = this._callback;

        this._callback = null;
        this._batchIndex = 0;
        callback.call(this, this.textures);
    }

    /**
     * Begin the next batch of textures.
     *
     * @private
     */
    _nextBatch()
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
                this._parseComplete();
            }
        }, 0);
    }

    /**
     * Destroy Spritesheet and don't use after this.
     *
     * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
     */
    destroy(destroyBase = false)
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
            this.baseTexture.destroy();
        }
        this.baseTexture = null;
    }
}
