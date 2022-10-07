import './settings';

/**
 * @namespace PIXI
 */

/**
 * String of the current PIXI version.
 * @memberof PIXI
 */
export const VERSION = '$_VERSION';

/** Export dependencies */
export * from '@pixi/constants';
export * from '@pixi/extensions';
export * from '@pixi/math';
export * from '@pixi/runner';
export * from '@pixi/settings';
export * from '@pixi/ticker';
import * as utils from '@pixi/utils';
export { utils };

export * from './textures/resources';
export * from './systems';
export * from './IRenderer';
export * from './autoDetectRenderer';
export * from './fragments';
export * from './system/ISystem';
export * from './IRenderer';
export * from './plugin/PluginSystem';
export * from './Renderer';
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
export * from './batch/BatchRenderer';
export * from './batch/BatchShaderGenerator';
export * from './batch/BatchGeometry';
export * from './batch/BatchDrawCall';
export * from './batch/BatchTextureArray';
export * from './utils/Quad';
export * from './utils/QuadUv';
export * from './shader/utils/checkMaxIfStatementsInShader';
export * from './shader/utils/uniformParsers';
export * from './shader/utils/generateUniformBufferSync';
export * from './shader/utils/getTestContext';
export * from './shader/utils/generateProgram';
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
export * from './transformFeedback/TransformFeedback';

export * from './mask/MaskSystem';
export * from './mask/StencilSystem';
export * from './mask/ScissorSystem';
export * from './filters/FilterSystem';
export * from './framebuffer/FramebufferSystem';
export * from './renderTexture/RenderTextureSystem';
export * from './textures/TextureSystem';
export * from './projection/ProjectionSystem';
export * from './state/StateSystem';
export * from './geometry/GeometrySystem';
export * from './shader/ShaderSystem';
export * from './context/ContextSystem';
export * from './batch/BatchSystem';
export * from './textures/TextureGCSystem';
export * from './geometry/BufferSystem';
export * from './plugin/PluginSystem';
export * from './framebuffer/MultisampleSystem';
export * from './renderTexture/GenerateTextureSystem';
export * from './renderTexture/GenerateTextureSystem';
export * from './background/BackgroundSystem';
export * from './view/ViewSystem';
export * from './render/ObjectRendererSystem';
export * from './startup/StartupSystem';
export * from './transformFeedback/TransformFeedbackSystem';
