import { BaseTexture, IBaseTextureOptions } from '../textures/BaseTexture';
import { Framebuffer } from '../framebuffer/Framebuffer';

import { MaskData } from '@pixi/core';
import { CanvasRenderTarget } from '@pixi/utils';

/**
 * A `PIXI.BaseRenderTexture` is a special base-texture that can be used to render any PixiJS
 * display object onto it.
 *
 * __Hint__: Before rendering a display-object onto a render-texture, you must ensure that it has loaded
 * otherwise black rectangles will be drawn instead.
 *
 * __Hint-2__: This is a base-texture, not a texture. It is must be used via `PIXI.RenderTexture`.
 *
 * __Hint-3__: The display-object rendered onto a render-texture will be transformed using its local-transform.
 *
 * The following example renders a sprite at `(400px, 300px)` onto the the render-texture.
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
 * To render this sprite at (0, 0), you can clear its local-transform; however, this will erase
 * the position, scale, and rotation properties and you must restore them yourself.
 *
 * ```js
 * sprite.setTransform()
 *
 * let baseRenderTexture = new PIXI.BaseRenderTexture({ width: 100, height: 100 });
 * let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
 *
 * renderer.render(sprite, renderTexture);  // Renders to center of RenderTexture
 * ```
 *
 * Description:
 * A `PIXI.BaseRenderTexture` holds a framebuffer with one color attachment. The `WebGLTexture` backing
 * the color attachment is lazily created; however, the base-texture itself has no `PIXI.Resource`
 * associated with it. All of the texture data lives in graphics-memory and cannot be used between
 * different (WebGL) contexts and (WebGL) renderers.
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
    _canvasRenderTarget: CanvasRenderTarget;

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

        /**
         * A reference to the canvas render target (we only need one as this can be shared across renderers)
         *
         * @protected
         * @member {object}
         */
        this._canvasRenderTarget = null;

        /**
         * The RGBA color used for erasing texture data and filling it with one solid
         * color. By default, the transparent/black color is used.
         *
         * @member {number[]}
         * @default [0, 0, 0, 0]
         */
        this.clearColor = [0, 0, 0, 0];

        /**
         * The framebuffer used to attach this texture as a render-target.
         *
         * @member {PIXI.Framebuffer}
         * @readonly
         */
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
     * Resizes this base render-texture.
     *
     * @param {number} width - the new width
     * @param {number} height - the new height
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
     *
     */
    destroy(): void
    {
        super.destroy();

        this.framebuffer = null;
    }
}
