import type {
    Gl2dImageSourceResource,
    Gl2dNodePropertiesBase,
    Gl2dPixiContainerExtension,
    Gl2dPixiTextureExtension,
    Gl2dPixiTextureSourceExtension,
    Gl2dTRSTransform,
    Gl2dVideoSourceResource,
} from './Gl2dSchema';

/**
 * Default values for core gl2d node properties.
 * Properties omitted from output when they match these values.
 * @category gl2d
 * @internal
 */
export const CORE_NODE_DEFAULTS: Required<
    Omit<
        Gl2dNodePropertiesBase,
        'type' | 'uid' | 'name' | 'children' | 'extensions' | 'mask'
    >
> &
    Required<Omit<Gl2dTRSTransform, 'matrix'>> = {
        translation: [0, 0],
        rotation: 0,
        scale: [1, 1],
        alpha: 1,
        visible: true,
        blendMode: 'normal',
    };

/**
 * Default values for the pixi_container_node extension.
 * Properties omitted from output when they match these values.
 * @category gl2d
 * @internal
 */
export const PIXI_CONTAINER_DEFAULTS: Required<
    Omit<Gl2dPixiContainerExtension, 'blendMode'>
> & {
    blendMode: string;
} = {
    origin: [0, 0],
    skew: [0, 0],
    pivot: [0, 0],
    anchor: [0, 0],
    width: 0,
    height: 0,
    tint: '#ffffff',
    blendMode: 'inherit',
    roundPixels: false,
    zIndex: 0,
    isRenderGroup: false,
    renderable: true,
    boundsArea: [0, 0, 0, 0],
    sortableChildren: false,

    // Events
    eventMode: 'passive',
    interactiveChildren: true,
    cursor: null,

    // Accessibility
    accessible: false,
    accessibleChildren: true,
    accessibleHint: null,
    accessiblePointerEvents: 'auto',
    accessibleText: null,
    accessibleTitle: null,
    accessibleType: 'button',
    tabIndex: 0,

    // Culling
    cullArea: [0, 0, 0, 0],
    cullableChildren: true,
    cullable: false,
};

/**
 * Default values for the pixi_texture_resource extension.
 * Properties omitted from output when they match these values.
 * @category gl2d
 * @internal
 */
export const PIXI_TEXTURE_DEFAULTS: Required<Gl2dPixiTextureExtension> = {
    orig: null,
    trim: null,
    defaultAnchor: null,
    defaultBorders: null,
    rotate: 0,
    dynamic: false,
};

/**
 * Default values for the pixi_texture_source_resource extension.
 * Properties omitted from output when they match these values.
 * @category gl2d
 * @internal
 */
export const PIXI_TEXTURE_SOURCE_DEFAULTS: Required<Gl2dPixiTextureSourceExtension>
    = {
        dimensions: '2d',
        mipLevelCount: 1,
        autoGenerateMipmaps: false,
        autoGarbageCollect: true,
        compare: null,
        maxAnisotropy: 1,
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
        addressModeW: 'clamp-to-edge',
        magFilter: 'linear',
        minFilter: 'linear',
        mipmapFilter: 'linear',
        lodMinClamp: 0,
        lodMaxClamp: 100,
    };

/**
 * Default values for video_source resource properties.
 * Properties omitted from output when they match these values.
 * @category gl2d
 * @internal
 */
export const VIDEO_SOURCE_DEFAULTS: Omit<
    Required<Gl2dVideoSourceResource>,
    'type' | 'uid' | 'name' | 'uri' | 'extensions' | 'crossorigin'
    | 'resolution' | 'alphaMode' | 'antialias' | 'scaleMode' | 'format' | 'addressMode' | 'width' | 'height'
> = {
    autoPlay: true,
    autoLoad: true,
    loop: false,
    muted: true,
    playsinline: true,
    preload: false,
    fps: 'auto' as const,
};

/**
 * Default values for core image_source resource properties.
 * @category gl2d
 * @internal
 */
export const IMAGE_SOURCE_DEFAULTS: Omit<
    Required<Gl2dImageSourceResource>,
    'type' | 'uid' | 'name' | 'uri' | 'extensions'
> = {
    resolution: 1,
    alphaMode: 'premultiply-alpha-on-upload' as const,
    antialias: false,
    scaleMode: 'linear' as const,
    format: 'bgra8unorm' as const,
    addressMode: 'clamp' as const,
    width: 1,
    height: 1,
};
