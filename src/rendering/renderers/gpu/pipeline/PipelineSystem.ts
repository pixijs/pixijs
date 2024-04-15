import { ExtensionType } from '../../../../extensions/Extensions';
import { warn } from '../../../../utils/logging/warn';
import { ensureAttributes } from '../../gl/shader/program/ensureAttributes';
import { STENCIL_MODES } from '../../shared/state/const';
import { createIdFromString } from '../../shared/utils/createIdFromString';
import { GpuStencilModesToPixi } from '../state/GpuStencilModesToPixi';

import type { Topology } from '../../shared/geometry/const';
import type { Geometry } from '../../shared/geometry/Geometry';
import type { State } from '../../shared/state/State';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';
import type { GpuRenderTarget } from '../renderTarget/GpuRenderTarget';
import type { GpuProgram } from '../shader/GpuProgram';
import type { StencilState } from '../state/GpuStencilModesToPixi';
import type { WebGPURenderer } from '../WebGPURenderer';

const topologyStringToId = {
    'point-list': 0,
    'line-list': 1,
    'line-strip': 2,
    'triangle-list': 3,
    'triangle-strip': 4,
};

// geometryLayouts = 256; // 8 bits // 256 states // value 0-255;
// shaderKeys = 256; // 8 bits // 256 states // value 0-255;
// state = 64; // 6 bits // 64 states // value 0-63;
// blendMode = 32; // 5 bits // 32 states // value 0-31;
// topology = 8; // 3 bits // 8 states // value 0-7;
function getGraphicsStateKey(
    geometryLayout: number,
    shaderKey: number,
    state: number,
    blendMode: number,
    topology: number,
): number
{
    return (geometryLayout << 24) // Allocate the 8 bits for geometryLayouts at the top
         | (shaderKey << 16) // Next 8 bits for shaderKeys
         | (state << 10) // 6 bits for state
         | (blendMode << 5) // 5 bits for blendMode
         | topology; // And 3 bits for topology at the least significant position
}

// colorMask = 16;// 4 bits // 16 states // value 0-15;
// stencilState = 8; // 3 bits // 8 states // value 0-7;
// renderTarget = 1; // 2 bit // 3 states // value 0-3; // none, stencil, depth, depth-stencil
// multiSampleCount = 1; // 1 bit // 2 states // value 0-1;
function getGlobalStateKey(
    stencilStateId: number,
    multiSampleCount: number,
    colorMask: number,
    renderTarget: number,
): number
{
    return (colorMask << 6) // Allocate the 4 bits for colorMask at the top
         | (stencilStateId << 3) // Next 3 bits for stencilStateId
         | (renderTarget << 1) // 2 bits for renderTarget
         | multiSampleCount; // And 1 bit for multiSampleCount at the least significant position
}

type PipeHash = Record<number, GPURenderPipeline>;

/**
 * A system that creates and manages the GPU pipelines.
 *
 * Caching Mechanism: At its core, the system employs a two-tiered caching strategy to minimize
 * the redundant creation of GPU pipelines (or "pipes"). This strategy is based on generating unique
 * keys that represent the state of the graphics settings and the specific requirements of the
 * item being rendered. By caching these pipelines, subsequent draw calls with identical configurations
 * can reuse existing pipelines instead of generating new ones.
 *
 * State Management: The system differentiates between "global" state properties (like color masks
 * and stencil masks, which do not change frequently) and properties that may vary between draw calls
 * (such as geometry, shaders, and blend modes). Unique keys are generated for both these categories
 * using getStateKey for global state and getGraphicsStateKey for draw-specific settings. These keys are
 * then then used to caching the pipe. The next time we need a pipe we can check
 * the cache by first looking at the state cache and then the pipe cache.
 * @memberof rendering
 */
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

    private _pipeCache: PipeHash = Object.create(null);
    private readonly _pipeStateCaches: Record<number, PipeHash> = Object.create(null);

    private _gpu: GPU;
    private _stencilState: StencilState;

    private _stencilMode: STENCIL_MODES;
    private _colorMask = 0b1111;
    private _multisampleCount = 1;
    private _depthStencilAttachment: 0 | 1;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
        this.setStencilMode(STENCIL_MODES.DISABLED);

        this._updatePipeHash();
    }

    public setMultisampleCount(multisampleCount: number): void
    {
        if (this._multisampleCount === multisampleCount) return;

        this._multisampleCount = multisampleCount;

        this._updatePipeHash();
    }

    public setRenderTarget(renderTarget: GpuRenderTarget)
    {
        this._multisampleCount = renderTarget.msaaSamples;
        this._depthStencilAttachment = renderTarget.descriptor.depthStencilAttachment ? 1 : 0;

        this._updatePipeHash();
    }

    public setColorMask(colorMask: number): void
    {
        if (this._colorMask === colorMask) return;

        this._colorMask = colorMask;

        this._updatePipeHash();
    }

    public setStencilMode(stencilMode: STENCIL_MODES): void
    {
        if (this._stencilMode === stencilMode) return;

        this._stencilMode = stencilMode;
        this._stencilState = GpuStencilModesToPixi[stencilMode];

        this._updatePipeHash();
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
            ensureAttributes(geometry, program.attributeData);

            // prepare the geometry for the pipeline
            this._generateBufferKey(geometry);
        }

        topology = topology || geometry.topology;

        // now we have set the Ids - the key is different...
        // eslint-disable-next-line max-len
        const key = getGraphicsStateKey(
            geometry._layoutKey,
            program._layoutKey,
            state.data,
            state._blendModeId,
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

        blendModes[0].writeMask = this._stencilMode === STENCIL_MODES.RENDERING_MASK_ADD ? 0 : this._colorMask;

        const layout = this._renderer.shader.getProgramData(program).pipeline;

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
            layout,
            multisample: {
                count: this._multisampleCount,
            },
            // depthStencil,
            label: `PIXI Pipeline`,
        };

        // only apply if the texture has stencil or depth
        if (this._depthStencilAttachment)
        {
            // mask states..
            descriptor.depthStencil = {
                ...this._stencilState,
                format: 'depth24plus-stencil8',
                depthWriteEnabled: state.depthTest,
                depthCompare: state.depthTest ? 'less' : 'always',
            };
        }

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

    private _generateBufferKey(geometry: Geometry): number
    {
        const keyGen = [];
        let index = 0;
        // generate a key..

        const attributeKeys = Object.keys(geometry.attributes).sort();

        for (let i = 0; i < attributeKeys.length; i++)
        {
            const attribute = geometry.attributes[attributeKeys[i]];

            keyGen[index++] = attribute.location;
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

                if ((attribute.divisor ?? 1) !== 1)
                {
                    // TODO: Maybe emulate divisor with storage_buffers/float_textures?
                    // For now just issue a warning
                    warn(`Attribute ${i} has an invalid divisor value of '${attribute.divisor}'. `
                        + 'WebGPU only supports a divisor value of 1');
                }

                if (attribute.buffer === buffer)
                {
                    bufferEntry.arrayStride = attribute.stride;
                    bufferEntry.stepMode = attribute.instance ? 'instance' : 'vertex';

                    bufferEntryAttributes.push({
                        shaderLocation: attribute.location,
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

    private _updatePipeHash(): void
    {
        const key = getGlobalStateKey(
            this._stencilMode,
            this._multisampleCount,
            this._colorMask,
            this._depthStencilAttachment
        );

        if (!this._pipeStateCaches[key])
        {
            this._pipeStateCaches[key] = Object.create(null);
        }

        this._pipeCache = this._pipeStateCaches[key];
    }

    public destroy(): void
    {
        (this._renderer as null) = null;
        this._bufferLayoutsCache = null;
    }
}
