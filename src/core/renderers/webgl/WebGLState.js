import mapWebGLBlendModesToPixi from './utils/mapWebGLBlendModesToPixi';

const BLEND = 0;
const DEPTH_TEST = 1;
const FRONT_FACE = 2;
const CULL_FACE = 3;
const BLEND_FUNC = 4;

/**
 * A WebGL state machines
 *
 * @memberof PIXI
 * @class
 */
export default class WebGLState
{
    /**
     * @param {WebGLRenderingContext} gl - The current WebGL rendering context
     */
    constructor(gl)
    {
        /**
         * The current active state
         *
         * @member {Uint8Array}
         */
        this.activeState = new Uint8Array(16);

        /**
         * The default state
         *
         * @member {Uint8Array}
         */
        this.defaultState = new Uint8Array(16);

        // default blend mode..
        this.defaultState[0] = 1;

        /**
         * The current state index in the stack
         *
         * @member {number}
         * @private
         */
        this.stackIndex = 0;

        /**
         * The stack holding all the different states
         *
         * @member {Array<*>}
         * @private
         */
        this.stack = [];

        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        this.maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

        this.attribState = {
            tempAttribState: new Array(this.maxAttribs),
            attribState: new Array(this.maxAttribs),
        };

        this.blendModes = mapWebGLBlendModesToPixi(gl);

        // check we have vao..
        this.nativeVaoExtension = (
            gl.getExtension('OES_vertex_array_object')
            || gl.getExtension('MOZ_OES_vertex_array_object')
            || gl.getExtension('WEBKIT_OES_vertex_array_object')
        );
    }

    /**
     * Pushes a new active state
     */
    push()
    {
        // next state..
        let state = this.stack[this.stackIndex];

        if (!state)
        {
            state = this.stack[this.stackIndex] = new Uint8Array(16);
        }

        ++this.stackIndex;

        // copy state..
        // set active state so we can force overrides of gl state
        for (let i = 0; i < this.activeState.length; i++)
        {
            state[i] = this.activeState[i];
        }
    }

    /**
     * Pops a state out
     */
    pop()
    {
        const state = this.stack[--this.stackIndex];

        this.setState(state);
    }

    /**
     * Sets the current state
     *
     * @param {*} state - The state to set.
     */
    setState(state)
    {
        this.setBlend(state[BLEND]);
        this.setDepthTest(state[DEPTH_TEST]);
        this.setFrontFace(state[FRONT_FACE]);
        this.setCullFace(state[CULL_FACE]);
        this.setBlendMode(state[BLEND_FUNC]);
    }

    /**
     * Enables or disabled blending.
     *
     * @param {boolean} value - Turn on or off webgl blending.
     */
    setBlend(value)
    {
        value = value ? 1 : 0;

        if (this.activeState[BLEND] === value)
        {
            return;
        }

        this.activeState[BLEND] = value;
        this.gl[value ? 'enable' : 'disable'](this.gl.BLEND);
    }

    /**
     * Sets the blend mode.
     *
     * @param {number} value - The blend mode to set to.
     */
    setBlendMode(value)
    {
        if (value === this.activeState[BLEND_FUNC])
        {
            return;
        }

        this.activeState[BLEND_FUNC] = value;

        this.gl.blendFunc(this.blendModes[value][0], this.blendModes[value][1]);
    }

    /**
     * Sets whether to enable or disable depth test.
     *
     * @param {boolean} value - Turn on or off webgl depth testing.
     */
    setDepthTest(value)
    {
        value = value ? 1 : 0;

        if (this.activeState[DEPTH_TEST] === value)
        {
            return;
        }

        this.activeState[DEPTH_TEST] = value;
        this.gl[value ? 'enable' : 'disable'](this.gl.DEPTH_TEST);
    }

    /**
     * Sets whether to enable or disable cull face.
     *
     * @param {boolean} value - Turn on or off webgl cull face.
     */
    setCullFace(value)
    {
        value = value ? 1 : 0;

        if (this.activeState[CULL_FACE] === value)
        {
            return;
        }

        this.activeState[CULL_FACE] = value;
        this.gl[value ? 'enable' : 'disable'](this.gl.CULL_FACE);
    }

    /**
     * Sets the gl front face.
     *
     * @param {boolean} value - true is clockwise and false is counter-clockwise
     */
    setFrontFace(value)
    {
        value = value ? 1 : 0;

        if (this.activeState[FRONT_FACE] === value)
        {
            return;
        }

        this.activeState[FRONT_FACE] = value;
        this.gl.frontFace(this.gl[value ? 'CW' : 'CCW']);
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
    resetToDefault()
    {
        // unbind any VAO if they exist..
        if (this.nativeVaoExtension)
        {
            this.nativeVaoExtension.bindVertexArrayOES(null);
        }

        // reset all attributes..
        this.resetAttributes();

        // set active state so we can force overrides of gl state
        for (let i = 0; i < this.activeState.length; ++i)
        {
            this.activeState[i] = 32;
        }

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

        this.setState(this.defaultState);
    }
}
