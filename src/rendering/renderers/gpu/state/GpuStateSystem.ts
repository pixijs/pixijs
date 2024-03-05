import { ExtensionType } from '../../../../extensions/Extensions';
import { State } from '../../shared/state/State';
import { GpuBlendModesToPixi } from './GpuBlendModesToPixi';

import type { BLEND_MODES } from '../../shared/state/const';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';

/**
 * System plugin to the renderer to manage WebGL state machines.
 * @memberof rendering
 */
export class GpuStateSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
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
     * @member {WebGLRenderingContext}
     * @readonly
     */
    protected gpu: GPU;

    /**
     * Default WebGL State
     * @readonly
     */
    protected defaultState: State;

    constructor()
    {
        this.defaultState = new State();
        this.defaultState.blend = true;
    }

    protected contextChange(gpu: GPU): void
    {
        this.gpu = gpu;
    }

    /**
     * Gets the blend mode data for the current state
     * @param state - The state to get the blend mode from
     */
    public getColorTargets(state: State): GPUColorTargetState[]
    {
        const blend = GpuBlendModesToPixi[state.blendMode] || GpuBlendModesToPixi.normal;

        return [
            {
                format: 'bgra8unorm',
                writeMask: 0,
                blend,
            },
        ];
    }

    public destroy(): void
    {
        this.gpu = null;
    }
}
