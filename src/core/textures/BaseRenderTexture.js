import BaseTexture from './BaseTexture';
import settings from '../settings';

/**
 * A BaseRenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a BaseRenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A BaseRenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * let renderer = PIXI.autoDetectRenderer(1024, 1024, { view: canvas, ratio: 1 });
 * let baseRenderTexture = new PIXI.BaseRenderTexture(renderer, 800, 600);
 * let sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * baseRenderTexture.render(sprite);
 * ```
 *
 * The Sprite in this case will be rendered using its local transform. To render this sprite at 0,0
 * you can clear the transform
 *
 * ```js
 *
 * sprite.setTransform()
 *
 * let baseRenderTexture = new PIXI.BaseRenderTexture(100, 100);
 * let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
 *
 * renderer.render(sprite, renderTexture);  // Renders to center of RenderTexture
 * ```
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 */
export default class BaseRenderTexture extends BaseTexture
{
    /**
     * @param {number} [width=100] - The width of the base render texture
     * @param {number} [height=100] - The height of the base render texture
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the texture being generated
     */
    constructor(width = 100, height = 100, scaleMode, resolution)
    {
        super(null, scaleMode);

        this.resolution = resolution || settings.RESOLUTION;

        this.width = width;
        this.height = height;

        this.realWidth = this.width * this.resolution;
        this.realHeight = this.height * this.resolution;

        this.scaleMode = scaleMode !== undefined ? scaleMode : settings.SCALE_MODE;
        this.hasLoaded = true;

        /**
         * A map of renderer IDs to webgl renderTargets
         *
         * @private
         * @member {object<number, WebGLTexture>}
         */
        this._glRenderTargets = {};

        /**
         * A reference to the canvas render target (we only need one as this can be shared across renderers)
         *
         * @private
         * @member {object<number, WebGLTexture>}
         */
        this._canvasRenderTarget = null;

        /**
         * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
         *
         * @member {boolean}
         */
        this.valid = false;
    }

    /**
     * Resizes the BaseRenderTexture.
     *
     * @param {number} width - The width to resize to.
     * @param {number} height - The height to resize to.
     */
    resize(width, height)
    {
        if (width === this.width && height === this.height)
        {
            return;
        }

        this.valid = (width > 0 && height > 0);

        this.width = width;
        this.height = height;

        this.realWidth = this.width * this.resolution;
        this.realHeight = this.height * this.resolution;

        if (!this.valid)
        {
            return;
        }

        this.emit('update', this);
    }

    /**
     * Destroys this texture
     *
     */
    destroy()
    {
        super.destroy(true);
        this.renderer = null;
    }
}
