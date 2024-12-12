import type { BLEND_MODES, CULL_MODES } from './const';

const blendModeIds = {
    normal: 0,
    add: 1,
    multiply: 2,
    screen: 3,
    overlay: 4,
    erase: 5,
    'normal-npm': 6,
    'add-npm': 7,
    'screen-npm': 8,
    min: 9,
    max: 10,
};
const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;
const DEPTH_MASK = 5;

/**
 * This is a WebGL state, and is is passed to {@link StateSystem}.
 *
 * Each mesh rendered may require WebGL to be in a different state.
 * For example you may want different blend mode or to enable polygon offsets
 * @memberof rendering
 */
export class State
{
    /**
     * The data is a unique number based on the states settings.
     * This lets us quickly compare states with a single number rather than looking
     * at all the individual settings.
     */
    public data: number;
    public _blendModeId: number;
    private _blendMode: BLEND_MODES;
    private _polygonOffset: number;

    constructor()
    {
        this.data = 0;

        this.blendMode = 'normal';
        this.polygonOffset = 0;

        this.blend = true;
        this.depthMask = true;
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

    /** The culling settings for this state none - No culling back - Back face culling front - Front face culling */
    set cullMode(value: CULL_MODES)
    {
        if (value === 'none')
        {
            this.culling = false;

            return;
        }

        this.culling = true;
        this.clockwiseFrontFace = value === 'front';
    }

    get cullMode(): CULL_MODES
    {
        if (!this.culling)
        {
            return 'none';
        }

        return this.clockwiseFrontFace ? 'front' : 'back';
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
     * The blend mode to be applied when this state is set. Apply a value of `normal` to reset the blend mode.
     * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
     * @default 'normal'
     */
    get blendMode(): BLEND_MODES
    {
        return this._blendMode;
    }

    set blendMode(value: BLEND_MODES)
    {
        this.blend = (value !== 'none');
        this._blendMode = value;
        this._blendModeId = blendModeIds[value as keyof typeof blendModeIds] || 0;
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
    public toString(): string
    {
        return `[pixi.js/core:State `
            + `blendMode=${this.blendMode} `
            + `clockwiseFrontFace=${this.clockwiseFrontFace} `
            + `culling=${this.culling} `
            + `depthMask=${this.depthMask} `
            + `polygonOffset=${this.polygonOffset}`
            + `]`;
    }
    // #endif

    /**
     * A quickly getting an instance of a State that is configured for 2d rendering.
     * @returns a new State with values set for 2d rendering
     */
    public static for2d(): State
    {
        const state = new State();

        state.depthTest = false;
        state.blend = true;

        return state;
    }

    public static default2d = State.for2d();
}

