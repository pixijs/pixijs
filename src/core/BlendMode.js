import { WebGLRenderingContext } from './utils/WebGLContextHelper';

const gl = WebGLRenderingContext;

/**
 * PIXI BlendMode: 2d compositionMode and webgl blendFunc params
 *
 * @class
 * @memberof PIXI
 */
export default class BlendMode
{

    /**
     * @param {number} [srcRGB] Multiplier for the RGB source blending factors
     * @param {number} [dstRGB] Multiplier for the RGB destination blending factors
     * @param {number} [srcAlpha] Multiplier for the alpha source blending factors
     * @param {number} [dstAlpha] Multiplier for the alpha destination blending factor
     * @param {number} [modeRGB] How the RGB components of source and destination colors are combined
     * @param {number} [modeAlpha] How the alpha component of source and destination colors are combined
     */
    constructor(srcRGB, dstRGB, srcAlpha, dstAlpha, modeRGB, modeAlpha)
    {
        this.code = 0;

        /**
         * Composition mode for canvas 2d context
         *
         * @member {number}
         */
        this.compositionMode = 'source-over';

        /**
         * non-premultipled and premultiplied versions.
         *
         * @member {Array<PIXI.BlendMode>}
         */
        this.npm = [this, this];

        /**
         * Multiplier for the RGB source blending factors
         *
         * @member {number}
         */
        this.srcRGB = srcRGB !== undefined ? srcRGB : gl.ONE;

        /**
         * Multiplier for the RGB destination blending factors
         *
         * @member {number}
         */
        this.dstRGB = dstRGB !== undefined ? dstRGB : gl.ONE_MINUS_SRC_ALPHA;

        /**
         * Multiplier for the alpha source blending factors
         *
         * @member {number}
         */
        this.srcAlpha = srcAlpha !== undefined ? srcAlpha : this.srcRGB;

        /**
         * Multiplier for the alpha destination blending factor
         *
         * @member {number}
         */
        this.dstAlpha = dstAlpha !== undefined ? dstAlpha : this.dstRGB;

        /**
         * How the RGB components of source and destination colors are combined
         *
         * @member {number}
         */
        this.modeRGB = modeRGB || gl.FUNC_ADD;

        /**
         * How the alpha component of source and destination colors are combined
         *
         * @member {number}
         */
        this.modeAlpha = modeAlpha || gl.FUNC_ADD;
    }

    /**
     * sets composition mode for 2d context
     *
     * @param {string} compositionMode context 2d composition mode
     * @returns {PIXI.BlendMode} returns self
     */
    setCompositionMode(compositionMode)
    {
        this.compositionMode = compositionMode;

        return this;
    }

    /**
     * automatically adds non-premultiplied version of blendMode
     * @returns {PIXI.BlendMode} returns self
     */
    addNpm()
    {
        this.npm[0] = new BlendMode(gl.SRC_ALPHA, this.dstRGB, this.srcAlpha, this.dstAlpha, this.modeRGB, this.modeAlpha);
        this.npm[0].npm[1] = this;

        return this;
    }

    /**
     * sets composition mode for 2d context
     *
     * @param {number} code pixi enum code
     * @returns {PIXI.BlendMode} returns self
     */
    setCode(code)
    {
        this.code = code;

        return this;
    }

    /**
     * creates context 2d composition mode that has default params for webgl
     *
     * @param {string} compositionMode context 2d composition mode
     * @returns {PIXI.BlendMode} created object
     */
    static from2d(compositionMode)
    {
        return new BlendMode().setCompositionMode(compositionMode);
    }
}

const from2d = BlendMode.from2d;

/**
 * Default blend modes supported by PIXI, in objects form. See {@link PIXI.BLEND_MODES}
 *
 * @memberOf PIXI.BlendMode
 * @static
 * @constant
 * @name values
 * @type {BlendMode[]}
 */
BlendMode.values = [
    new BlendMode(gl.ONE, gl.ONE_MINUS_SRC_ALPHA).addNpm().setCompositionMode('source-over'),
    new BlendMode(gl.ONE, gl.DST_ALPHA).setCompositionMode('lighter'),
    new BlendMode(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA).addNpm().setCompositionMode('multiply'),
    new BlendMode(gl.ONE, gl.ONE_MINUS_SRC_COLOR).addNpm().setCompositionMode('screen'),
    from2d('overlay'),
    from2d('darken'),
    from2d('lighten'),
    from2d('color-dodge'),
    from2d('color-burn'),
    from2d('hard-light'),
    from2d('soft-light'),
    from2d('difference'),
    from2d('exclusion'),
    from2d('hue'),
    from2d('saturate'),
    from2d('color'),
    from2d('luminosity'),
];

for (let i = 0; i < BlendMode.values.length; i++)
{
    BlendMode.values[i].setCode(i);
}
