import mapWebGLBlendModesToPixi from '../utils/mapWebGLBlendModesToPixi';
import WebGLSystem from './WebGLSystem';
import WebGLState from '../State';

const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;

/**
 * A WebGL state machines
 *
 * @memberof PIXI
 * @class
 */
export default class StateSystem extends WebGLSystem
{
    /**
     * @param {WebGLRenderingContext} gl - The current WebGL rendering context
     */
    constructor(renderer)
    {
        super(renderer);

        this.gl = null;

        this.maxAttribs = null;

        // check we have vao..
        this.nativeVaoExtension = null;

        this.attribState = null;

        this.stateId = 0;
        this.polygonOffset = 0;
        this.blendMode = 17;

        this.map = [];

        // map functions for when we set state..
        this.map[BLEND] = this.setBlend;
        this.map[OFFSET] = this.setOffset;
        this.map[CULLING] = this.setCullFace;
        this.map[DEPTH_TEST] = this.setDepthTest;
        this.map[WINDING] = this.setFrontFace;

        this.checks = [];

        this.defaultState = new WebGLState();
        this.defaultState.blend = true;
        this.defaultState.depth = true;
    }

    contextChange(gl)
    {
        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        this.maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

        // check we have vao..
        this.nativeVaoExtension = (
            gl.getExtension('OES_vertex_array_object')
            || gl.getExtension('MOZ_OES_vertex_array_object')
            || gl.getExtension('WEBKIT_OES_vertex_array_object')
        );

        this.attribState = {
            tempAttribState: new Array(this.maxAttribs),
            attribState: new Array(this.maxAttribs),
        };

        this.blendModes = mapWebGLBlendModesToPixi(gl);

        this.setState(this.defaultState);

        this.reset();
    }

    /**
     * Sets the current state
     *
     * @param {*} state - The state to set.
     */
    setState(state)
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
        this.gl.blendFunc(this.blendModes[value][0], this.blendModes[value][1]);
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

    /**
     * Disables all the vaos in use
     *
     */
    resetAttributes()
    {
        for (let i = 0; i < this.attribState.tempAttribState.length; i++)
        {
            this.attribState.tempAttribState[i] = 0;
        }

        for (let i = 0; i < this.attribState.attribState.length; i++)
        {
            this.attribState.attribState[i] = 0;
        }

        // im going to assume one is always active for performance reasons.
        for (let i = 1; i < this.maxAttribs; i++)
        {
            this.gl.disableVertexAttribArray(i);
        }
    }

    // used
    /**
     * Resets all the logic and disables the vaos
     */
    reset()
    {
        // unbind any VAO if they exist..
        if (this.nativeVaoExtension)
        {
            this.nativeVaoExtension.bindVertexArrayOES(null);
        }

        // reset all attributes..
        this.resetAttributes();

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

        this.setBlendMode(0);

        // TODO?
        // this.setState(this.defaultState);
    }

    /**
     * checks to see which updates should be checked based on which settings have been activated
     * for example if blend is enabled then we shold check the blend modes each time the state is changed
     * or if poygon fill is activated then we need to check if the polygone offset changes.
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

    // TODO - add polygon offset?
}
