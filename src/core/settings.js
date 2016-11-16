import maxRecommendedTextures from './utils/maxRecommendedTextures';

/**
 * @namespace PIXI.settings
 */
export default {

    /**
     * Target frames per millisecond.
     *
     * @static
     * @memberof PIXI.settings
     * @type {number}
     * @default 0.06
     */
    TARGET_FPMS: 0.06,

    /**
     * If set to true WebGL will attempt make textures mimpaped by default.
     * Mipmapping will only succeed if the base texture uploaded has power of two dimensions.
     *
     * @static
     * @memberof PIXI.settings
     * @type {boolean}
     * @default true
     */
    MIPMAP_TEXTURES: true,

    /**
     * Default resolution / device pixel ratio of the renderer.
     *
     * @static
     * @memberof PIXI.settings
     * @type {number}
     * @default 1
     */
    RESOLUTION: 1,

    /**
     * Default filter resolution.
     *
     * @static
     * @memberof PIXI.settings
     * @type {number}
     * @default 1
     */
    FILTER_RESOLUTION: 1,

    /**
     * The maximum textures that this device supports.
     *
     * @static
     * @memberof PIXI.settings
     * @type {number}
     * @default 32
     */
    SPRITE_MAX_TEXTURES: maxRecommendedTextures(32),

    /**
     * The default sprite batch size.
     *
     * The default aims to balance desktop and mobile devices.
     *
     * @static
     * @memberof PIXI.settings
     * @type {number}
     * @default 4096
     */
    SPRITE_BATCH_SIZE: 4096,
};
