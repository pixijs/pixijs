import { BLEND_MODES } from '@pixi/constants';

/* eslint-disable max-len */

const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;

/**
 * This is a WebGL state, and is is passed The WebGL StateManager.
 *
 * Each mesh rendered may require WebGL to be in a different state.
 * For example you may want different blend mode or to enable polygon offsets
 *
 * @class
 * @memberof PIXI
 */
export class State
{
    data: number;
    _blendMode: BLEND_MODES;
    _polygonOffset: number;

    constructor()
    {
        this.data = 0;

        this.blendMode = BLEND_MODES.NORMAL;
        this.polygonOffset = 0;

        this.blend = true;
        //  this.depthTest = true;
    }

    /**
     * Activates blending of the computed fragment color values
     *
     * @member {boolean}
     */
    get blend(): boolean
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
    get offsets(): boolean
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
    get culling(): boolean
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
    get depthTest(): boolean
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
    get clockwiseFrontFace(): boolean
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
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    get blendMode(): BLEND_MODES
    {
        return this._blendMode;
    }

    set blendMode(value) // eslint-disable-line require-jsdoc
    {
        this.blend = (value !== BLEND_MODES.NONE);
        this._blendMode = value;
    }

    /**
     * The polygon offset. Setting this property to anything other than 0 will automatically enable polygon offset fill.
     *
     * @member {number}
     * @default 0
     */
    get polygonOffset(): number
    {
        return this._polygonOffset;
    }

    set polygonOffset(value) // eslint-disable-line require-jsdoc
    {
        this.offsets = !!value;
        this._polygonOffset = value;
    }

    static for2d(): State
    {
        const state = new State();

        state.depthTest = false;
        state.blend = true;

        return state;
    }
}

