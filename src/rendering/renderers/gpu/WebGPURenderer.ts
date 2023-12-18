import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { GpuGraphicsAdaptor } from '../../../scene/graphics/gpu/GpuGraphicsAdaptor';
import { GpuMeshAdapter } from '../../../scene/mesh/gpu/GpuMeshAdapter';
import { GpuBatchAdaptor } from '../../batcher/gpu/GpuBatchAdaptor';
import { AbstractRenderer } from '../shared/system/AbstractRenderer';
import { SharedRenderPipes, SharedSystems } from '../shared/system/SharedSystems';
import { RendererType } from '../types';
import { BindGroupSystem } from './BindGroupSystem';
import { BufferSystem } from './buffer/GpuBufferSystem';
import { GpuColorMaskSystem } from './GpuColorMaskSystem';
import { type GPU, GpuDeviceSystem } from './GpuDeviceSystem';
import { GpuEncoderSystem } from './GpuEncoderSystem';
import { GpuStencilSystem } from './GpuStencilSystem';
import { GpuUniformBatchPipe } from './GpuUniformBatchPipe';
import { PipelineSystem } from './pipeline/PipelineSystem';
import { GpuRenderTargetSystem } from './renderTarget/GpuRenderTargetSystem';
import { GpuShaderSystem } from './shader/GpuShaderSystem';
import { GpuStateSystem } from './state/GpuStateSystem';
import { GpuTextureSystem } from './texture/GpuTextureSystem';

import type { ICanvas } from '../../../environment/canvas/ICanvas';
import type { PipeConstructor } from '../shared/instructions/RenderPipe';
import type { SystemConstructor } from '../shared/system/System';
import type { ExtractRendererOptions, ExtractSystemTypes } from '../shared/system/utils/typeUtils';

const DefaultWebGPUSystems = [
    ...SharedSystems,
    GpuEncoderSystem,
    GpuDeviceSystem,
    BufferSystem,
    GpuTextureSystem,
    GpuRenderTargetSystem,
    GpuShaderSystem,
    GpuStateSystem,
    PipelineSystem,
    GpuColorMaskSystem,
    GpuStencilSystem,
    BindGroupSystem,
];
const DefaultWebGPUPipes = [...SharedRenderPipes, GpuUniformBatchPipe];
const DefaultWebGPUAdapters = [GpuBatchAdaptor, GpuMeshAdapter, GpuGraphicsAdaptor];

// installed systems will bbe added to this array by the extensions manager..
const systems: { name: string; value: SystemConstructor }[] = [];
const renderPipes: { name: string; value: PipeConstructor }[] = [];
const renderPipeAdaptors: { name: string; value: any }[] = [];

extensions.handleByNamedList(ExtensionType.WebGPUSystem, systems);
extensions.handleByNamedList(ExtensionType.WebGPUPipes, renderPipes);
extensions.handleByNamedList(ExtensionType.WebGPUPipesAdaptor, renderPipeAdaptors);

// add all the default systems as well as any user defined ones from the extensions
extensions.add(...DefaultWebGPUSystems, ...DefaultWebGPUPipes, ...DefaultWebGPUAdapters);

type WebGPUSystems = ExtractSystemTypes<typeof DefaultWebGPUSystems> &
PixiMixins.RendererSystems &
PixiMixins.WebGPUSystems;

export type WebGPUPipes = ExtractSystemTypes<typeof DefaultWebGPUPipes> &
PixiMixins.RendererPipes &
PixiMixins.WebGPUPipes;

/** Options for WebGPURenderer. */
export type WebGPUOptions = ExtractRendererOptions<typeof DefaultWebGPUSystems> &
PixiMixins.RendererOptions &
PixiMixins.WebGPUOptions;

export interface WebGPURenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<WebGPUPipes, WebGPUOptions, T>,
    WebGPUSystems {}

export class WebGPURenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<WebGPUPipes, WebGPUOptions, T>
    implements WebGPUSystems
{
    public gpu: GPU;

    constructor()
    {
        const systemConfig = {
            name: 'webgpu',
            type: RendererType.WEBGPU,
            systems,
            renderPipes,
            renderPipeAdaptors,
        };

        super(systemConfig);
    }
}
