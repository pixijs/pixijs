import { GlBatchAdaptor } from '../../batcher/gl/GlBatchAdaptor';
import { GlGraphicsAdaptor } from '../../graphics/gl/GlGraphicsAdaptor';
import { GlMeshAdaptor } from '../../mesh/gl/GlMeshAdaptor';
import { GlBufferSystem } from './buffer/GlBufferSystem';
import { GlContextSystem } from './context/GlContextSystem';
import { GlGeometrySystem } from './geometry/GlGeometrySystem';
import { GlBackBufferSystem } from './GlBackBufferSystem';
import { GlColorMaskSystem } from './GlColorMaskSystem';
import { GlEncoderSystem } from './GlEncoderSystem';
import { GlRenderTargetSystem } from './GlRenderTargetSystem';
import { GlStencilSystem } from './GlStencilSystem';
import { GlShaderSystem } from './shader/GlShaderSystem';
import { GlUniformGroupSystem } from './shader/GlUniformGroupSystem';
import { GlStateSystem } from './state/GlStateSystem';
import { GlTextureSystem } from './texture/GlTextureSystem';

import type { SharedRenderPipes, SharedRenderSystems } from '../shared/system/SharedSystems';

export interface GLRenderSystems extends SharedRenderSystems, PixiMixins.GLRenderSystems
{
    backBuffer: GlBackBufferSystem,
    context: GlContextSystem,
    buffer: GlBufferSystem,
    texture: GlTextureSystem,
    renderTarget: GlRenderTargetSystem,
    geometry: GlGeometrySystem,
    uniformGroup: GlUniformGroupSystem,
    shader: GlShaderSystem,
    encoder: GlEncoderSystem,
    state: GlStateSystem,
    stencil: GlStencilSystem,
    colorMask: GlColorMaskSystem,
}

export interface GLRenderPipes extends SharedRenderPipes, PixiMixins.GLRenderPipes
{}

export const WebGLSystemExtensions = [
    GlBackBufferSystem,
    GlContextSystem,
    GlBufferSystem,
    GlTextureSystem,
    GlRenderTargetSystem,
    GlGeometrySystem,
    GlUniformGroupSystem,
    GlShaderSystem,
    GlEncoderSystem,
    GlStateSystem,
    GlStencilSystem,
    GlColorMaskSystem,
    // Pipes

    // Adapters
    GlBatchAdaptor,
    GlMeshAdaptor,
    GlGraphicsAdaptor,
];
