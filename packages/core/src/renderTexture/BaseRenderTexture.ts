import { BaseTexture } from '../textures/BaseTexture';
import { Framebuffer } from '../framebuffer/Framebuffer';

import type { IBaseTextureOptions } from '../textures/BaseTexture';
import type { MaskData } from '../mask/MaskData';

export interface BaseRenderTexture extends GlobalMixins.BaseRenderTexture, BaseTexture {}

/**
 * A BaseRenderTexture is a special texture that allows any PixiJS display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a BaseRenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A BaseRenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * let renderer = PIXI.autoDetectRenderer();
 * let baseRenderTexture = new PIXI.BaseRenderTexture({ width: 800, height: 600 });
 * let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
 * let sprite = PIXI.Sprite.from("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * renderer.render(sprite, renderTexture);
 * ```
 *
 * The Sprite in this case will be rendered using its local transform. To render this sprite at 0,0
 * you can clear the transform
 *
 * ```js
 *
 * sprite.setTransform()
 *
 * let baseRenderTexture = new PIXI.BaseRenderTexture({ width: 100, height: 100 });
 * let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
 *
 * renderer.render(sprite, renderTexture);  // Renders to center of RenderTexture
 * ```
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 */
export class BaseRenderTexture extends BaseTexture
{
    public clearColor: number[];
    public framebuffer: Framebuffer;
    maskStack: Array<MaskData>;
    filterStack: Array<any>;
    /**
     * @param {object} [options]
     * @param {number} [options.width=100] - The width of the base render texture.
     * @param {number} [options.height=100] - The height of the base render texture.
     * @param {PIXI.SCALE_MODES} [options.scaleMode] - See {@link PIXI.SCALE_MODES} for possible values.
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the texture being generated.
     */
    constructor(options: IBaseTextureOptions)
    {
        if (typeof options === 'number')
        {
            /* eslint-disable prefer-rest-params */
            // Backward compatibility of signature
            const width = arguments[0];
            const height = arguments[1];
            const scaleMode = arguments[2];
            const resolution = arguments[3];

            options = { width, height, scaleMode, resolution };
            /* eslint-enable prefer-rest-params */
        }

        super(null, options);

        const { width, height } = options || {};

        // Set defaults
        this.mipmap = 0;
        this.width = Math.ceil(width) || 100;
        this.height = Math.ceil(height) || 100;
        this.valid = true;

        this.clearColor = [0, 0, 0, 0];

        this.framebuffer = new Framebuffer(this.width * this.resolution, this.height * this.resolution)
            .addColorTexture(0, this);

        // TODO - could this be added the systems?

        /**
         * The data structure for the stencil masks.
         *
         * @member {PIXI.MaskData[]}
         */
        this.maskStack = [];

        /**
         * The data structure for the filters.
         *
         * @member {Object[]}
         */
        this.filterStack = [{}];
    }

    /**
     * Resizes the BaseRenderTexture.
     *
     * @param {number} width - The width to resize to.
     * @param {number} height - The height to resize to.
     */
    resize(width: number, height: number): void
    {
        width = Math.ceil(width);
        height = Math.ceil(height);
        this.framebuffer.resize(width * this.resolution, height * this.resolution);
    }

    /**
     * Frees the texture and framebuffer from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     *
     * @fires PIXI.BaseTexture#dispose
     */
    dispose(): void
    {
        this.framebuffer.dispose();

        super.dispose();
    }

    /**
     * Destroys this texture.
     */
    destroy(): void
    {
        super.destroy();

        this.framebuffer.destroyDepthTexture();
        this.framebuffer = null;
    }
}
