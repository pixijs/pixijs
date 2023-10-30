import { ExtensionType } from '../../../../extensions/Extensions';
import { STENCIL_MODES } from '../../shared/state/const';
import { createIdFromString } from '../../shared/utils/createIdFromString';
import { GpuStencilModesToPixi } from '../state/GpuStencilModesToPixi';

import type { Topology } from '../../shared/geometry/const';
import type { Geometry } from '../../shared/geometry/Geometry';
import type { State } from '../../shared/state/State';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';
import type { GpuProgram } from '../shader/GpuProgram';
import type { WebGPURenderer } from '../WebGPURenderer';

const topologyStringToId = {
    'point-list': 0,
    'line-list': 1,
    'line-strip': 2,
    'triangle-list': 3,
    'triangle-strip': 4,
};

// TODO use BIG int to manage the ids
// TODO can group the static ones together

// geometryLayouts = 256; // 8 bits // 256 states // value 0-255;
// shaderKeys = 256; // 8 bits // 256 states // value 0-255;
// colorMask = 16;// 4 bits // 16 states // value 0-15;
// state = 64; // 6 bits // 64 states // value 0-63;
// blendMode = 32; // 5 bits // 32 states // value 0-31;
// topology = 8; // 3 bits // 8 states // value 0-7;
// stencilState = 8; // 3 bits // 8 states // value 0-7;
// multiSampleCount = 1; // 1 bit // 2 states // value 0-1;
// total bit 34;

function getKey(
    geometryId: number,
    programId: number,
    stateId: number,
    blendModeId: number,
    stencilStateId: number,
    multiSampleCount: number,
    colorMask: number,
    topology: number,
)
{
    return (
        (geometryId << 26)
        | (programId << 18)
        | (colorMask << 14)
        | (stateId << 8)
        | (blendModeId << 3)
        | (topology << 1)
        | (stencilStateId << 4)
        | multiSampleCount
    );
}
export class PipelineSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGPUSystem],
        name: 'pipeline',
    } as const;
    private readonly _renderer: WebGPURenderer;

    protected CONTEXT_UID: number;

    private _moduleCache: Record<string, GPUShaderModule> = Object.create(null);
    private _bufferLayoutsCache: Record<number, GPUVertexBufferLayout[]> = Object.create(null);

    private _pipeCache: Record<number, GPURenderPipeline> = Object.create(null);

    private _gpu: GPU;
    private _stencilState: GPUDepthStencilState;

    private _stencilMode: STENCIL_MODES;
    private _colorMask = 0b1111;
    private _multisampleCount = 1;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
        this.setStencilMode(STENCIL_MODES.DISABLED);
    }

    public setMultisampleCount(multisampleCount: number): void
    {
        this._multisampleCount = multisampleCount;
    }

    public setColorMask(colorMask: number): void
    {
        this._colorMask = colorMask;
    }

    public setStencilMode(stencilMode: STENCIL_MODES): void
    {
        this._stencilMode = stencilMode;
        this._stencilState = GpuStencilModesToPixi[stencilMode];
    }

    public setPipeline(geometry: Geometry, program: GpuProgram, state: State, passEncoder: GPURenderPassEncoder): void
    {
        const pipeline = this.getPipeline(geometry, program, state);

        passEncoder.setPipeline(pipeline);
    }

    public getPipeline(
        geometry: Geometry,
        program: GpuProgram,
        state: State,
        topology?: Topology,
    ): GPURenderPipeline
    {
        if (!geometry._layoutKey)
        {
            // prepare the geometry for the pipeline
            this._generateBufferKey(geometry);
        }

        if (!program._layoutKey)
        {
            // prepare the program for the pipeline
            this._generateProgramKey(program);
            this._renderer.shader.createProgramLayout(program);
        }

        topology = topology || geometry.topology;

        // now we have set the Ids - the key is different...
        // eslint-disable-next-line max-len
        const key = getKey(
            geometry._layoutKey,
            program._layoutKey,
            state.data,
            state._blendModeId,
            this._stencilMode,
            this._multisampleCount,
            this._colorMask,
            topologyStringToId[topology],
        );

        if (this._pipeCache[key]) return this._pipeCache[key];

        this._pipeCache[key] = this._createPipeline(geometry, program, state, topology);

        return this._pipeCache[key];
    }

    private _createPipeline(geometry: Geometry, program: GpuProgram, state: State, topology: Topology): GPURenderPipeline
    {
        const device = this._gpu.device;

        const buffers = this._createVertexBufferLayouts(geometry);

        const blendModes = this._renderer.state.getColorTargets(state);

        let depthStencil = this._stencilState;

        // mask states..
        depthStencil = GpuStencilModesToPixi[this._stencilMode];

        blendModes[0].writeMask = this._stencilMode === STENCIL_MODES.RENDERING_MASK_ADD ? 0 : this._colorMask;

        const descriptor: GPURenderPipelineDescriptor = {
            // TODO later check if its helpful to create..
            // layout,
            vertex: {
                module: this._getModule(program.vertex.source),
                entryPoint: program.vertex.entryPoint,
                // geometry..
                buffers,
            },
            fragment: {
                module: this._getModule(program.fragment.source),
                entryPoint: program.fragment.entryPoint,
                targets: blendModes,
            },
            primitive: {
                topology,
                cullMode: state.cullMode,
            },
            layout: program._gpuLayout.pipeline,
            multisample: {
                count: this._multisampleCount,
            },
            depthStencil,
            label: `PIXI Pipeline`,
        };

        const pipeline = device.createRenderPipeline(descriptor);

        return pipeline;
    }

    private _getModule(code: string): GPUShaderModule
    {
        return this._moduleCache[code] || this._createModule(code);
    }

    private _createModule(code: string): GPUShaderModule
    {
        const device = this._gpu.device;

        this._moduleCache[code] = device.createShaderModule({
            code,
        });

        return this._moduleCache[code];
    }

    private _generateProgramKey(program: GpuProgram): number
    {
        const { vertex, fragment } = program;

        const bigKey = vertex.source + fragment.source + vertex.entryPoint + fragment.entryPoint;

        program._layoutKey = createIdFromString(bigKey, 'program');

        return program._layoutKey;
    }

    private _generateBufferKey(geometry: Geometry): number
    {
        const keyGen = [];
        let index = 0;
        // generate a key..

        const attributeKeys = Object.keys(geometry.attributes).sort();

        for (let i = 0; i < attributeKeys.length; i++)
        {
            const attribute = geometry.attributes[attributeKeys[i]];

            keyGen[index++] = attribute.shaderLocation;
            keyGen[index++] = attribute.offset;
            keyGen[index++] = attribute.format;
            keyGen[index++] = attribute.stride;
        }

        const stringKey = keyGen.join('');

        geometry._layoutKey = createIdFromString(stringKey, 'geometry');

        return geometry._layoutKey;
    }

    private _createVertexBufferLayouts(geometry: Geometry): GPUVertexBufferLayout[]
    {
        if (this._bufferLayoutsCache[geometry._layoutKey])
        {
            return this._bufferLayoutsCache[geometry._layoutKey];
        }

        const vertexBuffersLayout: GPUVertexBufferLayout[] = [];

        geometry.buffers.forEach((buffer) =>
        {
            const bufferEntry: GPUVertexBufferLayout = {
                arrayStride: 0,
                stepMode: 'vertex',
                attributes: [],
            };

            const bufferEntryAttributes = bufferEntry.attributes as GPUVertexAttribute[];

            for (const i in geometry.attributes)
            {
                const attribute = geometry.attributes[i];

                if (attribute.buffer === buffer)
                {
                    bufferEntry.arrayStride = attribute.stride;

                    bufferEntryAttributes.push({
                        shaderLocation: attribute.shaderLocation,
                        offset: attribute.offset,
                        format: attribute.format,
                    });
                }
            }

            if (bufferEntryAttributes.length)
            {
                vertexBuffersLayout.push(bufferEntry);
            }
        });

        this._bufferLayoutsCache[geometry._layoutKey] = vertexBuffersLayout;

        return vertexBuffersLayout;
    }

    public destroy(): void
    {
        (this._renderer as null) = null;
        this._bufferLayoutsCache = null;
    }
}
