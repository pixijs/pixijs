import { Color, settings, utils } from '@pixi/core';
import { canUseNewCanvasBlendModes } from './utils/canUseNewCanvasBlendModes';

import type { ICanvas, Texture } from '@pixi/core';

/**
 * Utility methods for Sprite/Texture tinting.
 *
 * Tinting with the CanvasRenderer involves creating a new canvas to use as a texture,
 * so be aware of the performance implications.
 * @namespace PIXI.canvasUtils
 * @memberof PIXI
 */
export const canvasUtils = {
    canvas: null as ICanvas,

    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Sprite} sprite - the sprite to tint
     * @param sprite.texture
     * @param {number} color - the color to use to tint the sprite with
     * @returns {ICanvas|HTMLImageElement} The tinted canvas
     */
    getTintedCanvas: (sprite: { texture: Texture }, color: number): ICanvas | HTMLImageElement =>
    {
        const texture = sprite.texture;
        const stringColor = Color.shared.setValue(color).toHex();

        texture.tintCache = texture.tintCache || {};

        const cachedCanvas = texture.tintCache[stringColor];

        let canvas: ICanvas;

        if (cachedCanvas)
        {
            if (cachedCanvas.tintId === texture._updateID)
            {
                return texture.tintCache[stringColor];
            }

            canvas = texture.tintCache[stringColor] as ICanvas;
        }
        else
        {
            canvas = settings.ADAPTER.createCanvas();
        }

        canvasUtils.tintMethod(texture, color, canvas);

        canvas.tintId = texture._updateID;

        // Convert tint to image only if ICanvas.toDataURL exists (e.g. OffscreenCanvas don't have toDataURL)
        if (canvasUtils.convertTintToImage && canvas.toDataURL !== undefined)
        {
            // is this better?
            const tintImage = new Image();

            tintImage.src = canvas.toDataURL();

            texture.tintCache[stringColor] = tintImage;
        }
        else
        {
            texture.tintCache[stringColor] = canvas;
        }

        return canvas;
    },

    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the sprite to tint
     * @param {number} color - the color to use to tint the sprite with
     * @returns {CanvasPattern} The tinted canvas
     */
    getTintedPattern: (texture: Texture, color: number): CanvasPattern =>
    {
        const stringColor = Color.shared.setValue(color).toHex();

        texture.patternCache = texture.patternCache || {};

        let pattern = texture.patternCache[stringColor];

        if (pattern?.tintId === texture._updateID)
        {
            return pattern;
        }
        if (!canvasUtils.canvas)
        {
            canvasUtils.canvas = settings.ADAPTER.createCanvas();
        }
        canvasUtils.tintMethod(texture, color, canvasUtils.canvas);
        pattern = canvasUtils.canvas.getContext('2d').createPattern(canvasUtils.canvas, 'repeat');
        pattern.tintId = texture._updateID;
        texture.patternCache[stringColor] = pattern;

        return pattern;
    },

    /**
     * Tint a texture using the 'multiply' operation.
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {PIXI.ICanvas} canvas - the current canvas
     */
    tintWithMultiply: (texture: Texture, color: number, canvas: ICanvas): void =>
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

        context.save();
        context.fillStyle = Color.shared.setValue(color).toHex();

        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'multiply';

        const source = texture.baseTexture.getDrawableSource();

        context.drawImage(
            source,
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
            source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
        context.restore();
    },

    /**
     * Tint a texture using the 'overlay' operation.
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {PIXI.ICanvas} canvas - the current canvas
     */
    tintWithOverlay: (texture: Texture, color: number, canvas: ICanvas): void =>
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

        context.save();
        context.globalCompositeOperation = 'copy';
        context.fillStyle = `#${(`00000${(color | 0).toString(16)}`).slice(-6)}`;
        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(
            texture.baseTexture.getDrawableSource(),
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
        context.restore();
    },

    /**
     * Tint a texture pixel per pixel.
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {PIXI.ICanvas} canvas - the current canvas
     */
    tintWithPerPixel: (texture: Texture, color: number, canvas: ICanvas): void =>
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

        context.save();
        context.globalCompositeOperation = 'copy';
        context.drawImage(
            texture.baseTexture.getDrawableSource(),
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
        context.restore();

        const [r, g, b] = Color.shared.setValue(color).toArray();
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
     * Rounds the specified color according to the canvasUtils.cacheStepsPerColorChannel.
     * @memberof PIXI.canvasUtils
     * @deprecated since 7.3.0
     * @see PIXI.Color.round
     * @param {number} color - the color to round, should be a hex color
     * @returns {number} The rounded color.
     */
    roundColor: (color: number): number =>
    {
        if (process.env.DEBUG)
        {
            utils.deprecation('7.3.0', 'PIXI.canvasUtils.roundColor is deprecated');
        }

        return Color.shared
            .setValue(color)
            .round(canvasUtils.cacheStepsPerColorChannel)
            .toNumber();
    },

    /**
     * Number of steps which will be used as a cap when rounding colors.
     * @memberof PIXI.canvasUtils
     * @deprecated since 7.3.0
     * @type {number}
     */
    cacheStepsPerColorChannel: 8,

    /**
     * Tint cache boolean flag.
     * @memberof PIXI.canvasUtils
     * @type {boolean}
     */
    convertTintToImage: false,

    /**
     * Whether or not the Canvas BlendModes are supported, consequently the ability to tint using the multiply method.
     * @memberof PIXI.canvasUtils
     * @type {boolean}
     */
    canUseMultiply: canUseNewCanvasBlendModes(),

    /**
     * The tinting method that will be used.
     * @memberof PIXI.canvasUtils
     * @type {Function}
     */
    tintMethod: null as (texture: Texture, color: number, canvas: ICanvas) => void,
};

canvasUtils.tintMethod = canvasUtils.canUseMultiply ? canvasUtils.tintWithMultiply : canvasUtils.tintWithPerPixel;
