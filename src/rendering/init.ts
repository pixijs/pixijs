import { extensions } from '../extensions/Extensions';
import { AlphaMask } from './mask/alpha/AlphaMask';
import { ColorMask } from './mask/color/ColorMask';
import { StencilMask } from './mask/stencil/StencilMask';
import { BufferImageSource } from './renderers/shared/texture/sources/BufferSource';
import { CanvasSource } from './renderers/shared/texture/sources/CanvasSource';
import { ImageSource } from './renderers/shared/texture/sources/ImageSource';
import { VideoSource } from './renderers/shared/texture/sources/VideoSource';

/**
 * The rendering namespace contains all the classes used for core rendering in PixiJS
 * this includes all the lower level resources such as Textures, Shaders, State, Buffers,
 * Geometry and the systems required to use them. This covers WebGL and WEbGPU and their shared classes.
 * @namespace rendering
 */

extensions.add(AlphaMask, ColorMask, StencilMask, VideoSource, ImageSource, CanvasSource, BufferImageSource);
