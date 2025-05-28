import { ExtensionType } from '../../../../extensions/Extensions';
import { type RenderTarget } from '../../shared/renderTarget/RenderTarget';
import { State } from '../../shared/state/State';
import { type WebGLRenderer } from '../WebGLRenderer';
import { mapWebGLBlendModesToPixi } from './mapWebGLBlendModesToPixi';

import type { BLEND_MODES } from '../../shared/state/const';
import type { System } from '../../shared/system/System';
import type { GlRenderingContext } from '../context/GlRenderingContext';

const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;
const DEPTH_MASK = 5;

/**
 * System plugin to the renderer to manage WebGL state machines
 * @category rendering
 * @advanced
 */
export class GlStateSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'state',
    } as const;

    /**
     * State ID
     * @readonly
     */
    public stateId: number;

    /**
     * Polygon offset
     * @readonly
     */
    public polygonOffset: number;

    /**
     * Blend mode
     * @default 'none'
     * @readonly
     */
    public blendMode: BLEND_MODES;

    /** Whether current blend equation is different */
    protected _blendEq: boolean;

    /**
     * GL context
     * @type {WebGLRenderingContext}
     * @readonly
     */
    protected gl: GlRenderingContext;

    protected blendModesMap: Record<BLEND_MODES, number[]>;

    /**
     * Collection of calls
     * @type {Function[]}
     */
    protected readonly map: ((value: boolean) => void)[];

    /**
     * Collection of check calls
     * @type {Function[]}
     */
    protected readonly checks: ((system: this, state: State) => void)[];

    /**
     * Default WebGL State
     * @readonly
     */
    protected defaultState: State;

    /**
     * Whether to invert the front face when rendering
     * This is used for render textures where the Y-coordinate is flipped
     * @default false
     */
    private _invertFrontFace: boolean = false;
    private _glFrontFace: boolean;
    private _cullFace: boolean;
    private _frontFaceDirty: boolean;
    private _frontFace: boolean;

    constructor(renderer: WebGLRenderer)
    {
        this.gl = null;

        this.stateId = 0;
        this.polygonOffset = 0;
        this.blendMode = 'none';

        this._blendEq = false;

        // map functions for when we set state..
        this.map = [];
        this.map[BLEND] = this.setBlend;
        this.map[OFFSET] = this.setOffset;
        this.map[CULLING] = this.setCullFace;
        this.map[DEPTH_TEST] = this.setDepthTest;
        this.map[WINDING] = this.setFrontFace;
        this.map[DEPTH_MASK] = this.setDepthMask;

        this.checks = [];

        this.defaultState = State.for2d();

        // listen for when the renderTarget changes
        // as rendering to textures means we need to invert the front face
        renderer.renderTarget.onRenderTargetChange.add(this);
    }

    protected onRenderTargetChange(renderTarget: RenderTarget)
    {
        this._invertFrontFace = !renderTarget.isRoot;

        // mini optimization to avoid setting the front face if culling is disabled
        if (this._cullFace)
        {
            // need to set the front face to the requested value as it matters because of the culling is active!
            this.setFrontFace(this._frontFace);
        }
        else
        {
            // if culling is disabled, we need to set the front face dirty
            this._frontFaceDirty = true;
        }
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this.gl = gl;

        this.blendModesMap = mapWebGLBlendModesToPixi(gl);

        // Reset face culling variables

        this.resetState();
    }

    /**
     * Sets the current state
     * @param {*} state - The state to set.
     */
    public set(state: State): void
    {
        state ||= this.defaultState;

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

                diff >>= 1;
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
     * Sets the state, when previous state is unknown.
     * @param {*} state - The state to set
     */
    public forceState(state: State): void
    {
        state ||= this.defaultState;
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
     * Sets whether to enable or disable blending.
     * @param value - Turn on or off WebGl blending.
     */
    public setBlend(value: boolean): void
    {
        this._updateCheck(GlStateSystem._checkBlendMode, value);

        this.gl[value ? 'enable' : 'disable'](this.gl.BLEND);
    }

    /**
     * Sets whether to enable or disable polygon offset fill.
     * @param value - Turn on or off webgl polygon offset testing.
     */
    public setOffset(value: boolean): void
    {
        this._updateCheck(GlStateSystem._checkPolygonOffset, value);

        this.gl[value ? 'enable' : 'disable'](this.gl.POLYGON_OFFSET_FILL);
    }

    /**
     * Sets whether to enable or disable depth test.
     * @param value - Turn on or off webgl depth testing.
     */
    public setDepthTest(value: boolean): void
    {
        this.gl[value ? 'enable' : 'disable'](this.gl.DEPTH_TEST);
    }

    /**
     * Sets whether to enable or disable depth mask.
     * @param value - Turn on or off webgl depth mask.
     */
    public setDepthMask(value: boolean): void
    {
        this.gl.depthMask(value);
    }

    /**
     * Sets whether to enable or disable cull face.
     * @param {boolean} value - Turn on or off webgl cull face.
     */
    public setCullFace(value: boolean): void
    {
        this._cullFace = value;
        this.gl[value ? 'enable' : 'disable'](this.gl.CULL_FACE);

        if (this._cullFace && this._frontFaceDirty)
        {
            // need to set the front face to the requested value as it matters because of the culling is active!
            this.setFrontFace(this._frontFace);
        }
    }

    /**
     * Sets the gl front face.
     * @param {boolean} value - true is clockwise and false is counter-clockwise
     */
    public setFrontFace(value: boolean): void
    {
        this._frontFace = value;
        this._frontFaceDirty = false;
        // If invertFrontFace is true, we invert the face direction
        const faceMode = this._invertFrontFace ? !value : value;

        if (this._glFrontFace !== faceMode)
        {
            this._glFrontFace = faceMode;
            this.gl.frontFace(this.gl[faceMode ? 'CW' : 'CCW']);
        }
    }

    /**
     * Sets the blend mode.
     * @param {number} value - The blend mode to set to.
     */
    public setBlendMode(value: BLEND_MODES): void
    {
        if (!this.blendModesMap[value])
        {
            value = 'normal';
        }

        if (value === this.blendMode)
        {
            return;
        }

        this.blendMode = value;

        const mode = this.blendModesMap[value];
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
     * @param {number} value - the polygon offset
     * @param {number} scale - the polygon offset scale
     */
    public setPolygonOffset(value: number, scale: number): void
    {
        this.gl.polygonOffset(value, scale);
    }

    /** Resets all the logic and disables the VAOs. */
    public resetState(): void
    {
        this._glFrontFace = false;
        this._frontFace = false;
        this._cullFace = false;
        this._frontFaceDirty = false;
        this._invertFrontFace = false;

        this.gl.frontFace(this.gl.CCW);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

        this.forceState(this.defaultState);

        this._blendEq = true;
        // setting to '' means the blend mode will be set as soon as we set the first blend mode when rendering!
        this.blendMode = '' as BLEND_MODES;
        this.setBlendMode('normal');
    }

    /**
     * Checks to see which updates should be checked based on which settings have been activated.
     *
     * For example, if blend is enabled then we should check the blend modes each time the state is changed
     * or if polygon fill is activated then we need to check if the polygon offset changes.
     * The idea is that we only check what we have too.
     * @param func - the checking function to add or remove
     * @param value - should the check function be added or removed.
     */
    private _updateCheck(func: (system: this, state: State) => void, value: boolean): void
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
     * @param system - the System to perform the state check on
     * @param state - the state that the blendMode will pulled from
     */
    private static _checkBlendMode(system: GlStateSystem, state: State): void
    {
        system.setBlendMode(state.blendMode);
    }

    /**
     * A private little wrapper function that we call to check the polygon offset.
     * @param system - the System to perform the state check on
     * @param state - the state that the blendMode will pulled from
     */
    private static _checkPolygonOffset(system: GlStateSystem, state: State): void
    {
        system.setPolygonOffset(1, state.polygonOffset);
    }

    /** @ignore */
    public destroy(): void
    {
        this.gl = null;
        this.checks.length = 0;
    }
}
