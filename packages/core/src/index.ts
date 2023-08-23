/// <reference path="../global.d.ts" />
import './settings';

/**
 * @namespace PIXI
 */

/**
 * String of the current PIXI version.
 * @memberof PIXI
 */
export const VERSION = process.env.VERSION;

// Export dependencies
export * from '@pixi/color';
export * from '@pixi/constants';
export * from '@pixi/extensions';
export * from '@pixi/math';
export * from '@pixi/runner';
export * from '@pixi/settings';
export * from '@pixi/ticker';
export * as utils from '@pixi/utils';

// Export core
export * from './autoDetectRenderer';
export * from './background/BackgroundSystem';
export * from './batch/BatchDrawCall';
export * from './batch/BatchGeometry';
export * from './batch/BatchRenderer';
export * from './batch/BatchShaderGenerator';
export * from './batch/BatchSystem';
export * from './batch/BatchTextureArray';
export * from './batch/ObjectRenderer';
export * from './context/ContextSystem';
export * from './filters/Filter';
export * from './filters/FilterState';
export * from './filters/FilterSystem';
export * from './filters/IFilterTarget';
export * from './filters/spriteMask/SpriteMaskFilter';
export * from './fragments';
export * from './framebuffer/Framebuffer';
export * from './framebuffer/FramebufferSystem';
export * from './framebuffer/GLFramebuffer';
export * from './framebuffer/MultisampleSystem';
export * from './geometry/Attribute';
export * from './geometry/Buffer';
export * from './geometry/BufferSystem';
export * from './geometry/Geometry';
export * from './geometry/GeometrySystem';
export * from './geometry/ViewableBuffer';
export * from './IRenderer';
export * from './IRenderer';
export * from './mask/MaskData';
export * from './mask/MaskSystem';
export * from './mask/ScissorSystem';
export * from './mask/StencilSystem';
export * from './plugin/PluginSystem';
export * from './plugin/PluginSystem';
export * from './projection/ProjectionSystem';
export * from './render/ObjectRendererSystem';
export * from './Renderer';
export * from './renderTexture/BaseRenderTexture';
export * from './renderTexture/GenerateTextureSystem';
export * from './renderTexture/GenerateTextureSystem';
export * from './renderTexture/RenderTexture';
export * from './renderTexture/RenderTexturePool';
export * from './renderTexture/RenderTextureSystem';
export * from './shader/GLProgram';
export * from './shader/Program';
export * from './shader/Shader';
export * from './shader/ShaderSystem';
export * from './shader/UniformGroup';
export * from './shader/utils/checkMaxIfStatementsInShader';
export * from './shader/utils/generateProgram';
export * from './shader/utils/generateUniformBufferSync';
export * from './shader/utils/getTestContext';
export * from './shader/utils/uniformParsers';
export * from './shader/utils/unsafeEvalSupported';
export * from './startup/StartupSystem';
export * from './state/State';
export * from './state/StateSystem';
export * from './system/ISystem';
export * from './systems';
export * from './textures/BaseTexture';
export * from './textures/GLTexture';
export * from './textures/resources';
export * from './textures/Texture';
export * from './textures/TextureGCSystem';
export * from './textures/TextureMatrix';
export * from './textures/TextureSystem';
export * from './textures/TextureUvs';
export * from './transformFeedback/TransformFeedback';
export * from './transformFeedback/TransformFeedbackSystem';
export * from './utils/Quad';
export * from './utils/QuadUv';
export * from './view/ViewSystem';
