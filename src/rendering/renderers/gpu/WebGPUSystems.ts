// RenderSystems
import { GpuBatchAdaptor } from '../../batcher/gpu/GpuBatchAdaptor';
import { GpuGraphicsAdaptor } from '../../graphics/gpu/GpuGraphicsAdaptor';
import { GpuScissorMaskPipe } from '../../mask/gpu/GpuScissorMaskPipe';
import { GpuMeshAdapter } from '../../mesh/gpu/GpuMeshAdapter';
import { UniformBatchPipe } from '../shared/instructions/UniformBatchPipe';
import { BindGroupSystem } from './BindGroupSystem';
import { BufferSystem } from './buffer/GpuBufferSystem';
import { GpuColorMaskSystem } from './GpuColorMaskSystem';
import { GpuDeviceSystem } from './GpuDeviceSystem';
import { GpuEncoderSystem } from './GpuEncoderSystem';
import { GpuStencilSystem } from './GpuStencilSystem';
import { PipelineSystem } from './pipeline/PipelineSystem';
import { GpuRenderTargetSystem } from './renderTarget/GpuRenderTargetSystem';
import { GpuShaderSystem } from './shader/GpuShaderSystem';
import { GpuStateSystem } from './state/GpuStateSystem';
import { GpuTextureSystem } from './texture/GpuTextureSystem';

import type { SharedRenderPipes, SharedRenderSystems } from '../shared/system/SharedSystems';

export interface GPURenderSystems extends SharedRenderSystems, PixiMixins.GPURenderSystems
{
    device: GpuDeviceSystem,
    buffer: BufferSystem,
    texture: GpuTextureSystem,
    renderTarget: GpuRenderTargetSystem,
    encoder: GpuEncoderSystem,
    shader: GpuShaderSystem,
    state: GpuStateSystem,
    pipeline: PipelineSystem,
    // bundle: GpuBundleSystem,
    colorMask: GpuColorMaskSystem,
    stencil: GpuStencilSystem,
    bindGroup: BindGroupSystem,
}

export interface GPURenderPipes extends SharedRenderPipes, PixiMixins.GPURenderPipes
{
    uniformBatch: UniformBatchPipe,
    scissorMask: GpuScissorMaskPipe,
}

export const WebGPUSystemsExtensions = [
    GpuDeviceSystem,
    BufferSystem,
    GpuTextureSystem,
    GpuRenderTargetSystem,
    GpuEncoderSystem,
    GpuShaderSystem,
    GpuStateSystem,
    PipelineSystem,
    // GpuBundleSystem,
    GpuColorMaskSystem,
    GpuStencilSystem,
    BindGroupSystem,
    // Pipes
    UniformBatchPipe,
    GpuScissorMaskPipe,
    // Adapters
    GpuBatchAdaptor,
    GpuMeshAdapter,
    GpuGraphicsAdaptor,
];
