/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type TextureStyle } from '../rendering/renderers/shared/texture/TextureStyle';

// ============================================================================
// gl2D File Format – TypeScript Schema
// Covers core spec + PixiJS extensions
// ============================================================================

// --- Primitives -------------------------------------------------------------

export type Gl2dRef = number | string;

export type Gl2dPoint2d = [x: number, y: number];

export type Gl2dMatrix2d = [a: number, b: number, c: number, d: number, tx: number, ty: number];

export type Gl2dRectangle = [x: number, y: number, width: number, height: number];

export type Gl2dCircle = [centerX: number, centerY: number, radius: number];

export type Gl2dBlendMode =
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'add'
    | 'subtract'
    | 'erase'
    | 'none';

export type Gl2dPixiBlendMode =
    | 'normal-npm'
    | 'add-npm'
    | 'screen-npm'
    | 'linear-burn'
    | 'linear-dodge'
    | 'linear-light'
    | 'pin-light'
    | 'vivid-light'
    | 'hard-mix'
    | 'negation'
    | 'min'
    | 'max'
    | 'divide';

export interface Gl2dMaskOptions
{
    node: Gl2dRef;
    inverse?: boolean;
}

// --- Root File --------------------------------------------------------------

export interface Gl2dFile
{
    asset: Gl2dAsset;
    scene?: Gl2dRef;
    scenes?: Gl2dScene[];
    nodes?: Gl2dNode[];
    resources?: Gl2dResource[];
    extensionsUsed?: (keyof Gl2dResourceExtensions)[];
    extensionsRequired?: (keyof Gl2dResourceExtensions)[];
}

export interface Gl2dAsset
{
    version: string;
    generator?: string;
    minVersion?: string;
}

// --- Scenes -----------------------------------------------------------------

export interface Gl2dScene
{
    name: string;
    nodes: Gl2dRef[];
    width?: number;
    height?: number;
}

// --- Nodes ------------------------------------------------------------------

// Non-transform properties shared by all node types
export interface Gl2dNodePropertiesBase
{
    type: string;
    uid: string;
    name?: string;
    children?: Gl2dRef[];
    alpha?: number;
    visible?: boolean;
    blendMode?: Gl2dBlendMode;
    mask?: Gl2dMaskOptions;
    extensions?: Gl2dNodeExtensions;
}

// TRS transform: forbids matrix
export interface Gl2dTRSTransform
{
    translation?: Gl2dPoint2d;
    rotation?: number;
    scale?: Gl2dPoint2d;
    matrix?: never;
}

// Matrix transform: forbids TRS
export interface Gl2dMatrixTransform
{
    matrix: Gl2dMatrix2d;
    translation?: never;
    rotation?: never;
    scale?: never;
}

export type Gl2dTransform = Gl2dTRSTransform | Gl2dMatrixTransform;

// Core node properties shared by all node types (TRS and matrix are mutually exclusive)
export type Gl2dCoreNodeProperties = Gl2dNodePropertiesBase & Gl2dTransform;

// Core node types

interface Gl2dContainerNodeBase extends Gl2dNodePropertiesBase
{
    type: 'container';
}
export type Gl2dContainerNode = Gl2dContainerNodeBase & Gl2dTransform;

interface Gl2dSpriteNodeBase extends Gl2dNodePropertiesBase
{
    type: 'sprite';
    texture: Gl2dRef;
}
export type Gl2dSpriteNode = Gl2dSpriteNodeBase & Gl2dTransform;

interface Gl2dTilingSpriteNodeBase extends Gl2dNodePropertiesBase
{
    type: 'tiling_sprite';
    texture: Gl2dRef;
    width?: number;
    height?: number;
    tileScale?: Gl2dPoint2d;
    tilePosition?: Gl2dPoint2d;
    tileRotation?: number;
}
export type Gl2dTilingSpriteNode = Gl2dTilingSpriteNodeBase & Gl2dTransform;

interface Gl2dNineSliceSpriteNodeBase extends Gl2dNodePropertiesBase
{
    type: 'nine_slice_sprite';
    texture: Gl2dRef;
    width?: number;
    height?: number;
    leftWidth?: number;
    topHeight?: number;
    rightWidth?: number;
    bottomHeight?: number;
}
export type Gl2dNineSliceSpriteNode = Gl2dNineSliceSpriteNodeBase & Gl2dTransform;

interface Gl2dTextNodeBase extends Gl2dNodePropertiesBase
{
    type: 'text';
    text: string;
    style: Gl2dRef;
    resolution?: number;
    webFont?: Gl2dRef;
}
export type Gl2dTextNode = Gl2dTextNodeBase & Gl2dTransform;

interface Gl2dBitmapTextNodeBase extends Gl2dNodePropertiesBase
{
    type: 'bitmap_text';
    text: string;
    style: Gl2dRef;
    resolution?: number;
    bitmapFont?: Gl2dRef;
}
export type Gl2dBitmapTextNode = Gl2dBitmapTextNodeBase & Gl2dTransform;

interface Gl2dHtmlTextNodeBase extends Gl2dNodePropertiesBase
{
    type: 'html_text';
    text: string;
    style: Gl2dRef;
    resolution?: number;
    webFont?: Gl2dRef;
}
export type Gl2dHtmlTextNode = Gl2dHtmlTextNodeBase & Gl2dTransform;

// Animated sprite: textures XOR (spritesheet + animation)
interface Gl2dAnimatedSpriteBase extends Gl2dNodePropertiesBase
{
    type: 'animated_sprite';
    animationSpeed?: number;
    loop?: boolean;
    autoPlay?: boolean;
    currentFrame?: number;
}

interface Gl2dAnimatedSpriteTexturesBase extends Gl2dAnimatedSpriteBase
{
    textures: Gl2dRef[];
    spritesheet?: never;
    animation?: never;
}

interface Gl2dAnimatedSpriteSheetBase extends Gl2dAnimatedSpriteBase
{
    spritesheet: Gl2dRef;
    animation: string;
    textures?: never;
}

export type Gl2dAnimatedSpriteTexturesNode = Gl2dAnimatedSpriteTexturesBase & Gl2dTransform;
export type Gl2dAnimatedSpriteSheetNode = Gl2dAnimatedSpriteSheetBase & Gl2dTransform;
export type Gl2dAnimatedSpriteNode = Gl2dAnimatedSpriteTexturesNode | Gl2dAnimatedSpriteSheetNode;

interface Gl2dGraphicsNodeBase extends Gl2dNodePropertiesBase
{
    type: 'graphics';
    context: Gl2dRef;
}
export type Gl2dGraphicsNode = Gl2dGraphicsNodeBase & Gl2dTransform;

interface Gl2dMeshNodeBase extends Gl2dNodePropertiesBase
{
    type: 'mesh';
    texture: Gl2dRef;
    vertices: number[];
    uvs: number[];
    indices?: number[];
    topology?: Gl2dTopology;
}
export type Gl2dMeshNode = Gl2dMeshNodeBase & Gl2dTransform;

export type Gl2dTopology = 'point-list' | 'line-list' | 'line-strip' | 'triangle-list' | 'triangle-strip';

interface Gl2dParticleContainerNodeBase extends Gl2dNodePropertiesBase
{
    type: 'particle_container';
    texture: Gl2dRef;
    positions: number[];
    rotations?: number[];
    scales?: number[];
    tints?: string[];
    alphas?: number[];
}
export type Gl2dParticleContainerNode = Gl2dParticleContainerNodeBase & Gl2dTransform;

interface Gl2dCustomNodeBase extends Gl2dNodePropertiesBase
{
    type: string;
    [key: string]: unknown;
}
export type Gl2dCustomNode = Gl2dCustomNodeBase & Gl2dTransform;

export type Gl2dCoreNode =
    | Gl2dContainerNode
    | Gl2dSpriteNode
    | Gl2dTilingSpriteNode
    | Gl2dNineSliceSpriteNode
    | Gl2dTextNode
    | Gl2dBitmapTextNode
    | Gl2dHtmlTextNode
    | Gl2dAnimatedSpriteNode
    | Gl2dGraphicsNode
    | Gl2dMeshNode
    | Gl2dParticleContainerNode
    | Gl2dCustomNode;

// --- PixiJS Extension Nodes -------------------------------------------------

interface Gl2dPixiMeshPlaneNodeBase extends Gl2dNodePropertiesBase
{
    type: 'pixi_mesh_plane';
    texture: Gl2dRef;
    verticesX?: number;
    verticesY?: number;
    autoResize?: boolean;
}
export type Gl2dPixiMeshPlaneNode = Gl2dPixiMeshPlaneNodeBase & Gl2dTransform;

interface Gl2dPixiMeshRopeNodeBase extends Gl2dNodePropertiesBase
{
    type: 'pixi_mesh_rope';
    texture: Gl2dRef;
    points: number[];
    textureScale?: number;
    autoUpdate?: boolean;
}
export type Gl2dPixiMeshRopeNode = Gl2dPixiMeshRopeNodeBase & Gl2dTransform;

interface Gl2dPixiPerspectiveMeshNodeBase extends Gl2dNodePropertiesBase
{
    type: 'pixi_perspective_mesh';
    texture: Gl2dRef;
    corners: [x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number];
    verticesX?: number;
    verticesY?: number;
}
export type Gl2dPixiPerspectiveMeshNode = Gl2dPixiPerspectiveMeshNodeBase & Gl2dTransform;

interface Gl2dPixiGifSpriteNodeBase extends Gl2dNodePropertiesBase
{
    type: 'pixi_gif_sprite';
    gif: Gl2dRef;
    animationSpeed?: number;
    loop?: boolean;
    autoPlay?: boolean;
    autoUpdate?: boolean;
    currentFrame?: number;
}
export type Gl2dPixiGifSpriteNode = Gl2dPixiGifSpriteNodeBase & Gl2dTransform;

interface Gl2dPixiSplitTextNodeBase extends Gl2dNodePropertiesBase
{
    type: 'pixi_split_text';
    text: string;
    style: Gl2dRef;
    resolution?: number;
    webFont?: Gl2dRef;
    charAnchor?: Gl2dPoint2d;
    wordAnchor?: Gl2dPoint2d;
    lineAnchor?: Gl2dPoint2d;
    autoSplit?: boolean;
}
export type Gl2dPixiSplitTextNode = Gl2dPixiSplitTextNodeBase & Gl2dTransform;

interface Gl2dPixiSplitBitmapTextNodeBase extends Gl2dNodePropertiesBase
{
    type: 'pixi_split_bitmap_text';
    text: string;
    style: Gl2dRef;
    resolution?: number;
    bitmapFont?: Gl2dRef;
    charAnchor?: Gl2dPoint2d;
    wordAnchor?: Gl2dPoint2d;
    lineAnchor?: Gl2dPoint2d;
    autoSplit?: boolean;
}
export type Gl2dPixiSplitBitmapTextNode = Gl2dPixiSplitBitmapTextNodeBase & Gl2dTransform;

interface Gl2dPixiDomContainerNodeBase extends Gl2dNodePropertiesBase
{
    type: 'pixi_dom_container';
    element: Gl2dRef;
    anchor?: Gl2dPoint2d;
}
export type Gl2dPixiDomContainerNode = Gl2dPixiDomContainerNodeBase & Gl2dTransform;

export type Gl2dPixiNode =
    | Gl2dPixiMeshPlaneNode
    | Gl2dPixiMeshRopeNode
    | Gl2dPixiPerspectiveMeshNode
    | Gl2dPixiGifSpriteNode
    | Gl2dPixiSplitTextNode
    | Gl2dPixiSplitBitmapTextNode
    | Gl2dPixiDomContainerNode;

export type Gl2dNode = Gl2dCoreNode | Gl2dPixiNode;

// --- Node Extensions --------------------------------------------------------

export interface Gl2dNodeExtensions
{
    pixi_container_node?: Gl2dPixiContainerExtension;
    pixi_text_node?: Gl2dPixiTextNodeExtension;
    pixi_html_text_node?: Gl2dPixiHtmlTextNodeExtension;
    pixi_tiling_sprite_node?: Gl2dPixiTilingSpriteNodeExtension;
    pixi_animated_sprite_node?: Gl2dPixiAnimatedSpriteNodeExtension;
    gl2d_filters?: Gl2dFiltersExtension;
    [key: string]: unknown;
}

export interface Gl2dPixiContainerExtension
{
    origin?: Gl2dPoint2d;
    skew?: Gl2dPoint2d;
    pivot?: Gl2dPoint2d;
    anchor?: Gl2dPoint2d;
    width?: number;
    height?: number;
    tint?: string;
    blendMode?: Gl2dPixiBlendMode;
    roundPixels?: boolean;
    zIndex?: number;
    isRenderGroup?: boolean;
    renderable?: boolean;
    boundsArea?: Gl2dRectangle;
    sortableChildren?: boolean;

    // Events
    eventMode?: 'none' | 'passive' | 'auto' | 'static' | 'dynamic';
    interactiveChildren?: boolean;
    cursor?: string;

    // Accessibility
    accessible?: boolean;
    accessibleChildren?: boolean;
    accessibleHint?: string;
    accessiblePointerEvents?: string;
    accessibleText?: string;
    accessibleTitle?: string;
    accessibleType?: string;
    tabIndex?: number;

    // Culling
    cullArea?: Gl2dRectangle;
    cullableChildren?: boolean;
    cullable?: boolean;
}

export interface Gl2dPixiTextNodeExtension
{
    textureStyle?: Record<string, unknown>;
    autoGenerateMipmaps?: boolean;
}

export interface Gl2dPixiHtmlTextNodeExtension
{
    textureStyle?: Record<string, unknown>;
    autoGenerateMipmaps?: boolean;
}

export interface Gl2dPixiTilingSpriteNodeExtension
{
    applyAnchorToTexture?: boolean;
    clampMargin?: number;
}

export interface Gl2dPixiAnimatedSpriteNodeExtension
{
    autoUpdate?: boolean;
    updateAnchor?: boolean;
}

export interface Gl2dFiltersExtension
{
    filters: Gl2dRef[];
}

// --- Resources --------------------------------------------------------------

// Texture

export interface Gl2dTextureResource
{
    type: 'texture';
    uid: `texture_resource_${string}`;
    name?: string;
    source: Gl2dRef;
    frame?: Gl2dRectangle;
    frameName?: string;
    extensions?: Gl2dResourceExtensions;
}

// Texture sources

export type Gl2dAlphaMode = 'no-premultiply-alpha' | 'premultiply-alpha-on-upload' | 'premultiplied-alpha';

export type Gl2dWrapMode = 'repeat' | 'clamp' | 'mirror';

export type Gl2dScaleMode = 'linear' | 'nearest';

export interface Gl2dTextureSourceBase
{
    uid: string;
    name?: string;
    uri?: string;
    width?: number;
    height?: number;
    resolution?: number;
    format?: string;
    antialias?: boolean;
    alphaMode?: Gl2dAlphaMode;
    addressMode?: Gl2dWrapMode;
    scaleMode?: Gl2dScaleMode;
    extensions?: Gl2dResourceExtensions;
}

export interface Gl2dImageSourceResource extends Gl2dTextureSourceBase
{
    type: 'image_source';
    uid: `image_source_${string}`;
}

export interface Gl2dVideoSourceResource extends Gl2dTextureSourceBase
{
    type: 'video_source';
    uid: `video_source_${string}`;
    autoLoad?: boolean;
    autoPlay?: boolean;
    crossorigin?: string;
    loop?: boolean;
    muted?: boolean;
    playsinline?: boolean;
    preload?: boolean;
    fps?: 'auto' | number;
}

// Spritesheet

export interface Gl2dSpritesheetResource
{
    type: 'spritesheet';
    uid: `spritesheet_resource_${string}`;
    name?: string;
    uri: string;
    source: Gl2dRef;
    extensions?: Gl2dResourceExtensions;
}

// Graphics context

export interface Gl2dGraphicsContextResource
{
    type: 'graphics_context';
    uid: `graphics_context_resource_${string}`;
    name?: string;
    commands: Gl2dGraphicsCommand[];
    extensions?: Gl2dResourceExtensions;
}

// Text style

export interface Gl2dTextStyleResource
{
    type: 'text_style';
    uid: `text_style_resource_${string}`;
    name?: string;
    fontFamily: string | string[];
    align?: Gl2dTextAlign;
    fontSize?: number;
    fontStyle?: Gl2dFontStyle;
    fontVariant?: Gl2dFontVariant;
    fontWeight?: string | number;
    fill?: string;
    letterSpacing?: number;
    padding?: number;
    stroke?: Gl2dTextStroke;
    shadow?: Gl2dTextShadow;
    textBaseline?: string;
    wordWrap?: Gl2dTextWordWrap;
    extensions?: Gl2dResourceExtensions;
}

export type Gl2dTextAlign = 'left' | 'center' | 'right' | 'justify';

export type Gl2dFontStyle = 'normal' | 'italic' | 'oblique';

export type Gl2dFontVariant = 'normal' | 'small-caps';

export type Gl2dLineCap = 'butt' | 'round' | 'square';

export type Gl2dLineJoin = 'miter' | 'round' | 'bevel';

export interface Gl2dTextStroke
{
    fill: string;
    width?: number;
    alignment?: number;
    cap?: Gl2dLineCap;
    join?: Gl2dLineJoin;
    miterLimit?: number;
}

export interface Gl2dTextShadow
{
    color?: string;
    offsetX?: number;
    offsetY?: number;
    blur?: number;
    alpha?: number;
}

export interface Gl2dTextWordWrap
{
    enabled?: boolean;
    width?: number;
}

// Canvas gradient

export interface Gl2dCanvasGradientResource
{
    type: 'canvas_gradient';
    uid: `canvas_gradient_resource_${string}`;
    name?: string;
    gradientType: 'linear' | 'radial';
    gradientUnits: 'local' | 'global';
    stops: (number | string)[];
    linear?: Gl2dLinearGradientConfig;
    radial?: Gl2dRadialGradientConfig;
    extensions?: Gl2dResourceExtensions;
}

export interface Gl2dLinearGradientConfig
{
    start: Gl2dPoint2d;
    end: Gl2dPoint2d;
}

export interface Gl2dRadialGradientConfig
{
    outerCircle: Gl2dCircle;
    innerCircle: Gl2dCircle;
}

// Canvas pattern

export type Gl2dPatternRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

export interface Gl2dCanvasPatternResource
{
    type: 'canvas_pattern';
    uid: `canvas_pattern_resource_${string}`;
    name?: string;
    source: Gl2dRef;
    repeat?: Gl2dPatternRepeat;
    transform?: Gl2dMatrix2d;
    extensions?: Gl2dResourceExtensions;
}

// Web font

export interface Gl2dWebFontResource
{
    type: 'web_font';
    uid: `web_font_resource_${string}`;
    name?: string;
    uri?: string;
    family: string;
    weights?: string[];
    style?: string;
    display?: string;
    stretch?: string;
    unicodeRange?: string;
    variant?: string;
    featureSettings?: string;
    extensions?: Gl2dResourceExtensions;
}

// Bitmap font

export interface Gl2dBitmapFontResource
{
    type: 'bitmap_font';
    uid: `bitmap_font_resource_${string}`;
    name?: string;
    uri?: string;
    fontFamily: string;
    extensions?: Gl2dResourceExtensions;
}

// Filter

export interface Gl2dFilterResource
{
    type: 'filter';
    uid: `filter_resource_${string}`;
    name?: string;
    filterType: string;
    params?: Record<string, unknown>;
    extensions?: Gl2dResourceExtensions;
}

// Custom resource

export interface Gl2dCustomResource
{
    type: string;
    uid: string;
    name?: string;
    extensions?: Gl2dResourceExtensions;
    [key: string]: unknown;
}

// PixiJS extension resources

export interface Gl2dPixiGifResource
{
    type: 'pixi_gif';
    uid: `pixi_gif_resource_${string}`;
    name?: string;
    uri: string;
    fps?: number;
}

export interface Gl2dPixiDomElementResource
{
    type: 'pixi_dom_element';
    uid: `pixi_dom_element_resource_${string}`;
    name?: string;
    selector?: string;
}

// Resource unions

export type Gl2dCoreResource =
    | Gl2dTextureResource
    | Gl2dImageSourceResource
    | Gl2dVideoSourceResource
    | Gl2dSpritesheetResource
    | Gl2dGraphicsContextResource
    | Gl2dTextStyleResource
    | Gl2dCanvasGradientResource
    | Gl2dCanvasPatternResource
    | Gl2dWebFontResource
    | Gl2dBitmapFontResource
    | Gl2dFilterResource
    | Gl2dCustomResource;

export type Gl2dPixiResource = Gl2dPixiGifResource | Gl2dPixiDomElementResource;

export type Gl2dResource = Gl2dCoreResource | Gl2dPixiResource | (Gl2dTextureSourceBase & { type: 'texture_source' });

// --- Resource Extensions ----------------------------------------------------

export interface Gl2dResourceExtensions
{
    pixi_texture_resource?: Gl2dPixiTextureExtension;
    pixi_texture_source_resource?: Gl2dPixiTextureSourceExtension;
    pixi_spritesheet?: Gl2dPixiSpritesheetExtension;
    pixi_text_style_resource?: Gl2dPixiTextStyleExtension;
    pixi_wrap_mode?: Gl2dPixiWrapModeExtension;
    pixi_canvas_gradient?: Gl2dPixiCanvasGradientExtension;
    [key: string]: unknown;
}

export interface Gl2dPixiTextureExtension
{
    orig?: Gl2dRectangle;
    trim?: Gl2dRectangle;
    defaultAnchor?: Gl2dPoint2d;
    defaultBorders?: [left: number, top: number, right: number, bottom: number];
    rotate?: number;
    dynamic?: boolean;
}

export interface Gl2dPixiTextureSourceExtension
{
    addressModeU?: TextureStyle['addressMode'];
    addressModeV?: TextureStyle['addressMode'];
    addressModeW?: TextureStyle['addressMode'];
    magFilter?: TextureStyle['magFilter'];
    minFilter?: TextureStyle['minFilter'];
    mipmapFilter?: TextureStyle['mipmapFilter'];
    lodMinClamp?: number;
    lodMaxClamp?: number;
    dimensions?: '1d' | '2d' | '3d';
    mipLevelCount?: number;
    autoGenerateMipmaps?: boolean;
    autoGarbageCollect?: boolean;
    compare?: TextureStyle['compare'];
    maxAnisotropy?: number;
}

export interface Gl2dPixiSpritesheetExtension
{
    cachePrefix?: string;
}

export interface Gl2dPixiTextStyleExtension
{
    trim?: boolean;
    leading?: number;
    lineHeight?: number;
}

export interface Gl2dPixiWrapModeExtension
{
    breakWords?: boolean;
    whiteSpace?: string;
}

export interface Gl2dPixiCanvasGradientExtension
{
    textureSize?: number;
    wrapMode?: string;
    scale?: number;
    rotation?: number;
}

// --- Graphics Commands (discriminated union) --------------------------------

// Path commands

export interface Gl2dMoveToCommand
{
    action: 'moveTo';
    x: number;
    y: number;
}

export interface Gl2dLineToCommand
{
    action: 'lineTo';
    x: number;
    y: number;
}

export interface Gl2dBezierCurveToCommand
{
    action: 'bezierCurveTo';
    cp1x: number;
    cp1y: number;
    cp2x: number;
    cp2y: number;
    x: number;
    y: number;
}

export interface Gl2dQuadraticCurveToCommand
{
    action: 'quadraticCurveTo';
    cpx: number;
    cpy: number;
    x: number;
    y: number;
}

export interface Gl2dArcCommand
{
    action: 'arc';
    x: number;
    y: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    counterclockwise?: boolean;
}

export interface Gl2dArcToCommand
{
    action: 'arcTo';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    radius: number;
}

export interface Gl2dClosePathCommand
{
    action: 'closePath';
}

export interface Gl2dRectCommand
{
    action: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Gl2dCircleCommand
{
    action: 'circle';
    x: number;
    y: number;
    radius: number;
}

export interface Gl2dEllipseCommand
{
    action: 'ellipse';
    x: number;
    y: number;
    halfWidth: number;
    halfHeight: number;
}

export interface Gl2dRoundRectCommand
{
    action: 'roundRect';
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
}

export interface Gl2dPolyCommand
{
    action: 'poly';
    points: number[];
    close?: boolean;
}

// Style commands

export interface Gl2dBeginFillCommand
{
    action: 'beginFill';
    color?: string;
    alpha?: number;
    texture?: Gl2dRef;
    matrix?: Gl2dMatrix2d;
}

export interface Gl2dEndFillCommand
{
    action: 'endFill';
}

export interface Gl2dBeginStrokeCommand
{
    action: 'beginStroke';
    color?: string;
    alpha?: number;
    width?: number;
    alignment?: number;
    cap?: Gl2dLineCap;
    join?: Gl2dLineJoin;
    miterLimit?: number;
}

export interface Gl2dEndStrokeCommand
{
    action: 'endStroke';
}

export type Gl2dGraphicsCommand =
    | Gl2dMoveToCommand
    | Gl2dLineToCommand
    | Gl2dBezierCurveToCommand
    | Gl2dQuadraticCurveToCommand
    | Gl2dArcCommand
    | Gl2dArcToCommand
    | Gl2dClosePathCommand
    | Gl2dRectCommand
    | Gl2dCircleCommand
    | Gl2dEllipseCommand
    | Gl2dRoundRectCommand
    | Gl2dPolyCommand
    | Gl2dBeginFillCommand
    | Gl2dEndFillCommand
    | Gl2dBeginStrokeCommand
    | Gl2dEndStrokeCommand;

// --- Core Node Type Constants -----------------------------------------------

export const GL2D_CORE_NODE_TYPES = [
    'container',
    'sprite',
    'tiling_sprite',
    'nine_slice_sprite',
    'text',
    'bitmap_text',
    'html_text',
    'animated_sprite',
    'graphics',
    'mesh',
    'particle_container',
] as const;

export type Gl2dCoreNodeType = (typeof GL2D_CORE_NODE_TYPES)[number];

export const GL2D_CORE_RESOURCE_TYPES = [
    'texture',
    'image_source',
    'video_source',
    'spritesheet',
    'graphics_context',
    'text_style',
    'web_font',
    'bitmap_font',
    'canvas_gradient',
    'canvas_pattern',
    'filter',
] as const;

export type Gl2dCoreResourceType = (typeof GL2D_CORE_RESOURCE_TYPES)[number];

export const GL2D_PIXI_NODE_TYPES = [
    'pixi_mesh_plane',
    'pixi_mesh_rope',
    'pixi_perspective_mesh',
    'pixi_gif_sprite',
    'pixi_split_text',
    'pixi_split_bitmap_text',
    'pixi_dom_container',
] as const;

export type Gl2dPixiNodeType = (typeof GL2D_PIXI_NODE_TYPES)[number];

export const GL2D_PIXI_RESOURCE_TYPES = ['pixi_gif', 'pixi_dom_element'] as const;

export type Gl2dPixiResourceType = (typeof GL2D_PIXI_RESOURCE_TYPES)[number];
