import consts from './const';
import math from './math';
import utils from './utils';
import ticker from './ticker';
import DisplayObject from './display/DisplayObject';
import Container from './display/Container';
import Transform from './display/Transform';
import TransformStatic from './display/TransformStatic';
import TransformBase from './display/TransformBase';
import Sprite from './sprites/Sprite';
import CanvasSpriteRenderer from './sprites/canvas/CanvasSpriteRenderer';
import CanvasTinter from './sprites/canvas/CanvasTinter';
import SpriteRenderer from './sprites/webgl/SpriteRenderer';
import Text from './text/Text';
import TextStyle from './text/TextStyle';
import Graphics from './graphics/Graphics';
import GraphicsData from './graphics/GraphicsData';
import GraphicsRenderer from './graphics/webgl/GraphicsRenderer';
import CanvasGraphicsRenderer from './graphics/canvas/CanvasGraphicsRenderer';
import Texture from './textures/Texture';
import BaseTexture from './textures/BaseTexture';
import RenderTexture from './textures/RenderTexture';
import BaseRenderTexture from './textures/BaseRenderTexture';
import VideoBaseTexture from './textures/VideoBaseTexture';
import TextureUvs from './textures/TextureUvs';
import CanvasRenderer from './renderers/canvas/CanvasRenderer';
import CanvasRenderTarget from './renderers/canvas/utils/CanvasRenderTarget';
import Shader from './Shader';
import WebGLRenderer from './renderers/webgl/WebGLRenderer';
import WebGLManager from './renderers/webgl/managers/WebGLManager';
import ObjectRenderer from './renderers/webgl/utils/ObjectRenderer';
import RenderTarget from './renderers/webgl/utils/RenderTarget';
import Quad from './renderers/webgl/utils/Quad';
import SpriteMaskFilter from './renderers/webgl/filters/spriteMask/SpriteMaskFilter';
import Filter from './renderers/webgl/filters/Filter';
import glCore from 'pixi-gl-core';

/**
 * @namespace PIXI
 */
// export core and const. We assign core to const so that the non-reference types in const remain in-tact
const core = Object.assign(consts, math, {
    // utils
    utils,
    ticker,

    // display
    DisplayObject,
    Container,
    Transform,
    TransformStatic,
    TransformBase,

    // sprites
    Sprite,
    CanvasSpriteRenderer,
    CanvasTinter,
    SpriteRenderer,

    // text
    Text,
    TextStyle,
    // primitives
    Graphics,
    GraphicsData,
    GraphicsRenderer,
    CanvasGraphicsRenderer,

    // textures
    Texture,
    BaseTexture,
    RenderTexture,
    BaseRenderTexture,
    VideoBaseTexture,
    TextureUvs,

    // renderers - canvas
    CanvasRenderer,
    CanvasRenderTarget,

    // renderers - webgl
    Shader,
    WebGLRenderer,
    WebGLManager,
    ObjectRenderer,
    RenderTarget,
    Quad,

    // filters - webgl
    SpriteMaskFilter,
    Filter,

    glCore,

    /**
     * This helper function will automatically detect which renderer you should be using.
     * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
     * the browser then this function will return a canvas renderer
     *
     * @memberof PIXI
     * @param width=800 {number} the width of the renderers view
     * @param height=600 {number} the height of the renderers view
     * @param [options] {object} The optional renderer parameters
     * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
     * @param [options.transparent=false] {boolean} If the render view is transparent, default false
     * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
     * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param [options.resolution=1] {number} The resolution / device pixel ratio of the renderer, retina would be 2
     * @param [noWebGL=false] {boolean} prevents selection of WebGL renderer, even if such is present
     *
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRenderer: function (width, height, options, noWebGL)
    {
        width = width || 800;
        height = height || 600;

        if (!noWebGL && core.utils.isWebGLSupported())
        {
            return new core.WebGLRenderer(width, height, options);
        }

        return new core.CanvasRenderer(width, height, options);
    }
});

export default core;