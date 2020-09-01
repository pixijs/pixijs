import './settings';

import {
    INSTALLED,
    autoDetectResource,
    Resource,
    AbstractMultiResource,
    ArrayResource,
    BaseImageResource,
    BufferResource,
    CanvasResource,
    CubeResource,
    ImageResource,
    SVGResource,
    VideoResource,
    ImageBitmapResource
} from './textures/resources';

import type { IResourcePlugin } from './textures/resources';

import {
    FilterSystem,
    BatchSystem,
    ContextSystem,
    FramebufferSystem,
    GeometrySystem,
    MaskSystem,
    ScissorSystem,
    StencilSystem,
    ProjectionSystem,
    RenderTextureSystem,
    ShaderSystem,
    StateSystem,
    TextureGCSystem,
    TextureSystem
} from './systems';

export const resources = {
    INSTALLED: INSTALLED as IResourcePlugin[],
    autoDetectResource,
    Resource,
    AbstractMultiResource,
    ArrayResource,
    BaseImageResource,
    BufferResource,
    CanvasResource,
    CubeResource,
    ImageResource,
    SVGResource,
    VideoResource,
    ImageBitmapResource
};

export interface resources {
    INSTALLED: IResourcePlugin[];
    autoDetectResource: typeof autoDetectResource;
    Resource: Resource;
    AbstractMultiResource: AbstractMultiResource;
    ArrayResource: ArrayResource;
    BaseImageResource: BaseImageResource;
    BufferResource: BufferResource;
    CanvasResource: CanvasResource;
    CubeResource: CubeResource;
    ImageResource: ImageResource;
    SVGResource: SVGResource;
    VideoResource: VideoResource;
    ImageBitmapResource: ImageBitmapResource;
}

export const systems = {
    FilterSystem,
    BatchSystem,
    ContextSystem,
    FramebufferSystem,
    GeometrySystem,
    MaskSystem,
    ScissorSystem,
    StencilSystem,
    ProjectionSystem,
    RenderTextureSystem,
    ShaderSystem,
    StateSystem,
    TextureGCSystem,
    TextureSystem
};

export interface systems {
    FilterSystem: FilterSystem;
    BatchSystem: BatchSystem;
    ContextSystem: ContextSystem;
    FramebufferSystem: FramebufferSystem;
    GeometrySystem: GeometrySystem;
    MaskSystem: MaskSystem;
    ScissorSystem: ScissorSystem;
    StencilSystem: StencilSystem;
    ProjectionSystem: ProjectionSystem;
    RenderTextureSystem: RenderTextureSystem;
    ShaderSystem: ShaderSystem;
    StateSystem: StateSystem;
    TextureGCSystem: TextureGCSystem;
    TextureSystem: TextureSystem;
}

export * from './IRenderingContext';
export * from './autoDetectRenderer';
export * from './fragments';
export * from './System';
export * from './Renderer';
export * from './AbstractRenderer';
export * from './framebuffer/Framebuffer';
export * from './framebuffer/GLFramebuffer';
export * from './textures/Texture';
export * from './textures/BaseTexture';
export * from './textures/GLTexture';
export * from './textures/TextureMatrix';
export * from './renderTexture/RenderTexture';
export * from './renderTexture/RenderTexturePool';
export * from './renderTexture/BaseRenderTexture';
export * from './textures/TextureUvs';
export * from './state/State';
export * from './batch/ObjectRenderer';
export * from './batch/AbstractBatchRenderer';
export * from './batch/BatchPluginFactory';
export * from './batch/BatchShaderGenerator';
export * from './batch/BatchGeometry';
export * from './batch/BatchDrawCall';
export * from './batch/BatchTextureArray';
export * from './utils/Quad';
export * from './utils/QuadUv';
export * from './shader/utils/checkMaxIfStatementsInShader';
export * from './shader/utils/uniformParsers';
export * from './shader/Shader';
export * from './shader/Program';
export * from './shader/GLProgram';
export * from './shader/UniformGroup';
export * from './mask/MaskData';
export * from './filters/spriteMask/SpriteMaskFilter';
export * from './filters/Filter';
export * from './filters/FilterState';
export * from './filters/IFilterTarget';
export * from './geometry/Attribute';
export * from './geometry/Buffer';
export * from './geometry/Geometry';
export * from './geometry/ViewableBuffer';
