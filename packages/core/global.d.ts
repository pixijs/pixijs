declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface BaseTexture
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Texture
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface BaseRenderTexture
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IRendererOptions
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IRenderableObject
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Renderer
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IRenderer
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IRendererPlugins
    {

    }

    interface Settings
    {
        /** @deprecated since 7.1.0 */
        FILTER_RESOLUTION: number;
        /** @deprecated since 7.1.0 */
        FILTER_MULTISAMPLE: import('@pixi/constants').MSAA_QUALITY;
        /** @deprecated since 7.1.0 */
        SPRITE_MAX_TEXTURES: number;
        /** @deprecated since 7.1.0 */
        SPRITE_BATCH_SIZE: number;
        /** @deprecated since 7.1.0 */
        MIPMAP_TEXTURES: import('@pixi/constants').MIPMAP_MODES;
        /** @deprecated since 7.1.0 */
        ANISOTROPIC_LEVEL: number;
        /** @deprecated since 7.1.0 */
        WRAP_MODE: import('@pixi/constants').WRAP_MODES;
        /** @deprecated since 7.1.0 */
        SCALE_MODE: import('@pixi/constants').SCALE_MODES;
        /** @deprecated since 7.1.0 */
        CAN_UPLOAD_SAME_BUFFER: boolean;
        /** @deprecated since 7.1.0 */
        PRECISION_VERTEX: import('@pixi/constants').PRECISION,
        /** @deprecated since 7.1.0 */
        PRECISION_FRAGMENT: import('@pixi/constants').PRECISION,
        /** @deprecated since 7.1.0 */
        GC_MODE: import('@pixi/constants').GC_MODES,
        /** @deprecated since 7.1.0 */
        GC_MAX_IDLE: number,
        /** @deprecated since 7.1.0 */
        GC_MAX_CHECK_COUNT: number,

        RENDER_OPTIONS: import('@pixi/core').IRendererOptions;
        STRICT_TEXTURE_CACHE: boolean;
        PREFER_ENV: import('@pixi/constants').ENV;
    }
}
