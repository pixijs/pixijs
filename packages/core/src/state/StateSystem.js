import { mapWebGLBlendModesToPixi } from './utils/mapWebGLBlendModesToPixi';
import { System } from '../System';
import { State } from './State';
import { BLEND_MODES } from '@pixi/constants';

const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;

/**
 * System plugin to the renderer to manage WebGL state machines.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export class StateSystem extends System
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * GL context
         * @member {WebGLRenderingContext}
         * @readonly
         */
        this.gl = null;

        /**
         * State ID
         * @member {number}
         * @readonly
         */
        this.stateId = 0;

        /**
         * Polygon offset
         * @member {number}
         * @readonly
         */
        this.polygonOffset = 0;

        /**
         * Blend mode
         * @member {number}
         * @default PIXI.BLEND_MODES.NONE
         * @readonly
         */
        this.blendMode = BLEND_MODES.NONE;

        /**
         * Whether current blend equation is different
         * @member {boolean}
         * @protected
         */
        this._blendEq = false;

        /**
         * Collection of calls
         * @member {function[]}
         * @readonly
         */
        this.map = [];

        // map functions for when we set state..
        this.map[BLEND] = this.setBlend;
        this.map[OFFSET] = this.setOffset;
        this.map[CULLING] = this.setCullFace;
        this.map[DEPTH_TEST] = this.setDepthTest;
        this.map[WINDING] = this.setFrontFace;

        /**
         * Collection of check calls
         * @member {function[]}
         * @readonly
         */
        this.checks = [];

        /**
         * Default WebGL State
         * @member {PIXI.State}
         * @readonly
         */
        this.defaultState = new State();
        this.defaultState.blend = true;
        this.defaultState.depth = true;
    }

    contextChange(gl)
    {
        this.gl = gl;

        this.blendModes = mapWebGLBlendModesToPixi(gl);

        this.set(this.defaultState);

        this.reset();
    }

    /**
     * Sets the current state
     *
     * @param {*} state - The state to set.
     */
    set(state)
    {
        state = state || this.defaultState;

        // TODO maybe to an object check? ( this.state === state )?
        if (this.stateId !== state.data)
        {
            let diff = this.stateId ^ state.data;
            let i = 0;

            // order from least to most common
            while (diff)
            {
                if (diff & 1)
                {
                    // state change!
                    this.map[i].call(this, !!(state.data & (1 << i)));
                }

                diff = diff >> 1;
                i++;
            }

            this.stateId = state.data;
        }

        // based on the above settings we check for specific modes..
        // for example if blend is active we check and set the blend modes
        // or of polygon offset is active we check the poly depth.
        for (let i = 0; i < this.checks.length; i++)
        {
            this.checks[i](this, state);
        }
    }

    /**
     * Sets the state, when previous state is unknown
     *
     * @param {*} state - The state to set
     */
    forceState(state)
    {
        state = state || this.defaultState;
        for (let i = 0; i < this.map.length; i++)
        {
            this.map[i].call(this, !!(state.data & (1 << i)));
        }
        for (let i = 0; i < this.checks.length; i++)
        {
            this.checks[i](this, state);
        }

        this.stateId = state.data;
    }

    /**
     * Enables or disabled blending.
     *
     * @param {boolean} value - Turn on or off webgl blending.
     */
    setBlend(value)
    {
        this.updateCheck(StateSystem.checkBlendMode, value);

        this.gl[value ? 'enable' : 'disable'](this.gl.BLEND);
    }

    /**
     * Enables or disable polygon offset fill
     *
     * @param {boolean} value - Turn on or off webgl polygon offset testing.
     */
    setOffset(value)
    {
        this.updateCheck(StateSystem.checkPolygonOffset, value);

        this.gl[value ? 'enable' : 'disable'](this.gl.POLYGON_OFFSET_FILL);
    }

    /**
     * Sets whether to enable or disable depth test.
     *
     * @param {boolean} value - Turn on or off webgl depth testing.
     */
    setDepthTest(value)
    {
        this.gl[value ? 'enable' : 'disable'](this.gl.DEPTH_TEST);
    }

    /**
     * Sets whether to enable or disable cull face.
     *
     * @param {boolean} value - Turn on or off webgl cull face.
     */
    setCullFace(value)
    {
        this.gl[value ? 'enable' : 'disable'](this.gl.CULL_FACE);
    }

    /**
     * Sets the gl front face.
     *
     * @param {boolean} value - true is clockwise and false is counter-clockwise
     */
    setFrontFace(value)
    {
        this.gl.frontFace(this.gl[value ? 'CW' : 'CCW']);
    }

    /**
     * Sets the blend mode.
     *
     * @param {number} value - The blend mode to set to.
     */
    setBlendMode(value)
    {
        if (value === this.blendMode)
        {
            return;
        }

        this.blendMode = value;

        const mode = this.blendModes[value];
        const gl = this.gl;

        if (mode.length === 2)
        {
            gl.blendFunc(mode[0], mode[1]);
        }
        else
        {
            gl.blendFuncSeparate(mode[0], mode[1], mode[2], mode[3]);
        }
        if (mode.length === 6)
        {
            this._blendEq = true;
            gl.blendEquationSeparate(mode[4], mode[5]);
        }
        else if (this._blendEq)
        {
            this._blendEq = false;
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        }
    }

    /**
     * Sets the polygon offset.
     *
     * @param {number} value - the polygon offset
     * @param {number} scale - the polygon offset scale
     */
    setPolygonOffset(value, scale)
    {
        this.gl.polygonOffset(value, scale);
    }

    // used
    /**
     * Resets all the logic and disables the vaos
     */
    reset()
    {
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

        this.forceState(0);

        this._blendEq = true;
        this.blendMode = -1;
        this.setBlendMode(0);
    }

    /**
     * checks to see which updates should be checked based on which settings have been activated.
     * For example, if blend is enabled then we should check the blend modes each time the state is changed
     * or if polygon fill is activated then we need to check if the polygon offset changes.
     * The idea is that we only check what we have too.
     *
     * @param {Function} func  the checking function to add or remove
     * @param {boolean} value  should the check function be added or removed.
     */
    updateCheck(func, value)
    {
        const index = this.checks.indexOf(func);

        if (value && index === -1)
        {
            this.checks.push(func);
        }
        else if (!value && index !== -1)
        {
            this.checks.splice(index, 1);
        }
    }

    /**
     * A private little wrapper function that we call to check the blend mode.
     *
     * @static
     * @private
     * @param {PIXI.StateSystem} System  the System to perform the state check on
     * @param {PIXI.State} state  the state that the blendMode will pulled from
     */
    static checkBlendMode(system, state)
    {
        system.setBlendMode(state.blendMode);
    }

    /**
     * A private little wrapper function that we call to check the polygon offset.
     *
     * @static
     * @private
     * @param {PIXI.StateSystem} System  the System to perform the state check on
     * @param {PIXI.State} state  the state that the blendMode will pulled from
     */
    static checkPolygonOffset(system, state)
    {
        system.setPolygonOffset(state.polygonOffset, 0);
    }
}
