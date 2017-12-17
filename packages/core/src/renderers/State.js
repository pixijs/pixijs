/* eslint-disable max-len */

const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;

/**
 * This is a webGL state. It is passed The WebGL StateManager.
 * Each mesh renderered may require webGL to be in a different state.
 * For example you may want different blend mode or to enable polygon offsets
 *
 * @class
 * @memberof PIXI
 */
export default class State
{
    /**
     *
     */
    constructor()
    {
        this.data = 0;

        this.blendMode = 0;
        this.polygonOffset = 0;

        this.blend = true;
        //  this.depthTest = true;
    }

    /**
     * Activates blending of the computed fragment color values
     *
     * @member {boolean}
     */
    get blend()
    {
        return !!(this.data & (1 << BLEND));
    }

    set blend(value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << BLEND)) !== value)
        {
            this.data ^= (1 << BLEND);
        }
    }

    /**
     * Activates adding an offset to depth values of polygon's fragments
     *
     * @member {boolean}
     * @default false
     */
    get offsets()
    {
        return !!(this.data & (1 << OFFSET));
    }

    set offsets(value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << OFFSET)) !== value)
        {
            this.data ^= (1 << OFFSET);
        }
    }

    /**
     * Activates culling of polygons.
     *
     * @member {boolean}
     * @default false
     */
    get culling()
    {
        return !!(this.data & (1 << CULLING));
    }

    set culling(value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << CULLING)) !== value)
        {
            this.data ^= (1 << CULLING);
        }
    }

    /**
     * Activates depth comparisons and updates to the depth buffer.
     *
     * @member {boolean}
     * @default false
     */
    get depthTest()
    {
        return !!(this.data & (1 << DEPTH_TEST));
    }

    set depthTest(value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << DEPTH_TEST)) !== value)
        {
            this.data ^= (1 << DEPTH_TEST);
        }
    }

    /**
     * Specifies whether or not front or back-facing polygons can be culled.
     * @member {boolean}
     * @default false
     */
    get clockwiseFrontFace()
    {
        return !!(this.data & (1 << WINDING));
    }

    set clockwiseFrontFace(value) // eslint-disable-line require-jsdoc
    {
        if (!!(this.data & (1 << WINDING)) !== value)
        {
            this.data ^= (1 << WINDING);
        }
    }

    /**
     * The blend mode to be applied when this state is set. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
     *
     * @member {boolean}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    get blendMode()
    {
        return this._blendMode;
    }

    set blendMode(value) // eslint-disable-line require-jsdoc
    {
        // 17 is NO BLEND
        this.blend = (value !== 17);
        this._blendMode = value;
    }

    /**
     * The polygon offset. Setting this property to anything other than 0 will automatically enable poygon offset fill.
     *
     * @member {number}
     * @default 0
     */
    get polygonOffset()
    {
        return this._polygonOffset;
    }

    set polygonOffset(value) // eslint-disable-line require-jsdoc
    {
        this.offsets = !!value;
        this._polygonOffset = value;
    }
}

