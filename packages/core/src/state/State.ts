import { BLEND_MODES } from '@pixi/constants';

/* eslint-disable max-len */

const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;
const DEPTH_MASK = 5;

/**
 * This is a WebGL state, and is is passed to {@link PIXI.StateSystem}.
 *
 * Each mesh rendered may require WebGL to be in a different state.
 * For example you may want different blend mode or to enable polygon offsets
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
        this.depthMask = true;
        //  this.depthTest = true;
    }

    /**
     * Activates blending of the computed fragment color values.
     * @default true
     */
    get blend(): boolean
    {
        return !!(this.data & (1 << BLEND));
    }

    set blend(value: boolean)
    {
        if (!!(this.data & (1 << BLEND)) !== value)
        {
            this.data ^= (1 << BLEND);
        }
    }

    /**
     * Activates adding an offset to depth values of polygon's fragments
     * @default false
     */
    get offsets(): boolean
    {
        return !!(this.data & (1 << OFFSET));
    }

    set offsets(value: boolean)
    {
        if (!!(this.data & (1 << OFFSET)) !== value)
        {
            this.data ^= (1 << OFFSET);
        }
    }

    /**
     * Activates culling of polygons.
     * @default false
     */
    get culling(): boolean
    {
        return !!(this.data & (1 << CULLING));
    }

    set culling(value: boolean)
    {
        if (!!(this.data & (1 << CULLING)) !== value)
        {
            this.data ^= (1 << CULLING);
        }
    }

    /**
     * Activates depth comparisons and updates to the depth buffer.
     * @default false
     */
    get depthTest(): boolean
    {
        return !!(this.data & (1 << DEPTH_TEST));
    }

    set depthTest(value: boolean)
    {
        if (!!(this.data & (1 << DEPTH_TEST)) !== value)
        {
            this.data ^= (1 << DEPTH_TEST);
        }
    }

    /**
     * Enables or disables writing to the depth buffer.
     * @default true
     */
    get depthMask(): boolean
    {
        return !!(this.data & (1 << DEPTH_MASK));
    }

    set depthMask(value: boolean)
    {
        if (!!(this.data & (1 << DEPTH_MASK)) !== value)
        {
            this.data ^= (1 << DEPTH_MASK);
        }
    }

    /**
     * Specifies whether or not front or back-facing polygons can be culled.
     * @default false
     */
    get clockwiseFrontFace(): boolean
    {
        return !!(this.data & (1 << WINDING));
    }

    set clockwiseFrontFace(value: boolean)
    {
        if (!!(this.data & (1 << WINDING)) !== value)
        {
            this.data ^= (1 << WINDING);
        }
    }

    /**
     * The blend mode to be applied when this state is set. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode(): BLEND_MODES
    {
        return this._blendMode;
    }

    set blendMode(value: BLEND_MODES)
    {
        this.blend = (value !== BLEND_MODES.NONE);
        this._blendMode = value;
    }

    /**
     * The polygon offset. Setting this property to anything other than 0 will automatically enable polygon offset fill.
     * @default 0
     */
    get polygonOffset(): number
    {
        return this._polygonOffset;
    }

    set polygonOffset(value: number)
    {
        this.offsets = !!value;
        this._polygonOffset = value;
    }

    // #if _DEBUG
    toString(): string
    {
        return `[@pixi/core:State `
            + `blendMode=${this.blendMode} `
            + `clockwiseFrontFace=${this.clockwiseFrontFace} `
            + `culling=${this.culling} `
            + `depthMask=${this.depthMask} `
            + `polygonOffset=${this.polygonOffset}`
            + `]`;
    }
    // #endif

    static for2d(): State
    {
        const state = new State();

        state.depthTest = false;
        state.blend = true;

        return state;
    }
}

