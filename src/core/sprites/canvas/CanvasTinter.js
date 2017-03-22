import { hex2rgb, rgb2hex } from '../../utils';
import canUseNewCanvasBlendModes from '../../renderers/canvas/utils/canUseNewCanvasBlendModes';

/**
 * Utility methods for Sprite/Texture tinting.
 *
 * @class
 * @memberof PIXI
 */
const CanvasTinter = {
    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.CanvasTinter
     * @param {PIXI.Sprite} sprite - the sprite to tint
     * @param {number} color - the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedTexture: (sprite, color) =>
    {
        const texture = sprite._texture;

        color = CanvasTinter.roundColor(color);

        const stringColor = `#${(`00000${(color | 0).toString(16)}`).substr(-6)}`;

        texture.tintCache = texture.tintCache || {};

        if (texture.tintCache[stringColor])
        {
            return texture.tintCache[stringColor];
        }

        // clone texture..
        const canvas = CanvasTinter.canvas || document.createElement('canvas');

        // CanvasTinter.tintWithPerPixel(texture, stringColor, canvas);
        CanvasTinter.tintMethod(texture, color, canvas);

        if (CanvasTinter.convertTintToImage)
        {
            // is this better?
            const tintImage = new Image();

            tintImage.src = canvas.toDataURL();

            texture.tintCache[stringColor] = tintImage;
        }
        else
        {
            texture.tintCache[stringColor] = canvas;
            // if we are not converting the texture to an image then we need to lose the reference to the canvas
            CanvasTinter.canvas = null;
        }

        return canvas;
    },

    /**
     * Tint a texture using the 'multiply' operation.
     *
     * @memberof PIXI.CanvasTinter
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithMultiply: (texture, color, canvas) =>
    {
        const context = canvas.getContext('2d');
        const crop = texture._frame.clone();
        const resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.fillStyle = `#${(`00000${(color | 0).toString(16)}`).substr(-6)}`;

        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'multiply';

        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        context.globalCompositeOperation = 'destination-atop';

        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
    },

    /**
     * Tint a texture using the 'overlay' operation.
     *
     * @memberof PIXI.CanvasTinter
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithOverlay(texture, color, canvas)
    {
        const context = canvas.getContext('2d');
        const crop = texture._frame.clone();
        const resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.globalCompositeOperation = 'copy';
        context.fillStyle = `#${(`00000${(color | 0).toString(16)}`).substr(-6)}`;
        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        // context.globalCompositeOperation = 'copy';
    },

    /**
     * Tint a texture pixel per pixel.
     *
     * @memberof PIXI.CanvasTinter
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithPerPixel: (texture, color, canvas) =>
    {
        const context = canvas.getContext('2d');
        const crop = texture._frame.clone();
        const resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.globalCompositeOperation = 'copy';
        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        const rgbValues = hex2rgb(color);
        const r = rgbValues[0];
        const g = rgbValues[1];
        const b = rgbValues[2];

        const pixelData = context.getImageData(0, 0, crop.width, crop.height);

        const pixels = pixelData.data;

        for (let i = 0; i < pixels.length; i += 4)
        {
            pixels[i + 0] *= r;
            pixels[i + 1] *= g;
            pixels[i + 2] *= b;
        }

        context.putImageData(pixelData, 0, 0);
    },

    /**
     * Rounds the specified color according to the CanvasTinter.cacheStepsPerColorChannel.
     *
     * @memberof PIXI.CanvasTinter
     * @param {number} color - the color to round, should be a hex color
     * @return {number} The rounded color.
     */
    roundColor: (color) =>
    {
        const step = CanvasTinter.cacheStepsPerColorChannel;

        const rgbValues = hex2rgb(color);

        rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
        rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
        rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);

        return rgb2hex(rgbValues);
    },

    /**
     * Number of steps which will be used as a cap when rounding colors.
     *
     * @memberof PIXI.CanvasTinter
     * @type {number}
     */
    cacheStepsPerColorChannel: 8,

    /**
     * Tint cache boolean flag.
     *
     * @memberof PIXI.CanvasTinter
     * @type {boolean}
     */
    convertTintToImage: false,

    /**
     * Whether or not the Canvas BlendModes are supported, consequently the ability to tint using the multiply method.
     *
     * @memberof PIXI.CanvasTinter
     * @type {boolean}
     */
    canUseMultiply: canUseNewCanvasBlendModes(),

    /**
     * The tinting method that will be used.
     *
     * @memberof PIXI.CanvasTinter
     * @type {tintMethodFunctionType}
     */
    tintMethod: 0,
};

CanvasTinter.tintMethod = CanvasTinter.canUseMultiply ? CanvasTinter.tintWithMultiply : CanvasTinter.tintWithPerPixel;

/**
 * The tintMethod type.
 *
 * @memberof PIXI.CanvasTinter
 * @callback tintMethodFunctionType
 * @param texture {PIXI.Texture} the texture to tint
 * @param color {number} the color to use to tint the sprite with
 * @param canvas {HTMLCanvasElement} the current canvas
 */

export default CanvasTinter;
