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
        /** @deprecated */
        FILTER_RESOLUTION: number;
        /** @deprecated */
        FILTER_MULTISAMPLE: import('@pixi/constants').MSAA_QUALITY;
        /** @deprecated */
        SPRITE_MAX_TEXTURES: number;
        /** @deprecated */
        SPRITE_BATCH_SIZE: number;
        /** @deprecated */
        MIPMAP_TEXTURES: import('@pixi/constants').MIPMAP_MODES;
        /** @deprecated */
        ANISOTROPIC_LEVEL: number;
        /** @deprecated */
        WRAP_MODE: import('@pixi/constants').WRAP_MODES;
        /** @deprecated */
        SCALE_MODE: import('@pixi/constants').SCALE_MODES;
        /** @deprecated */
        CAN_UPLOAD_SAME_BUFFER: boolean;
        /** @deprecated */
        PRECISION_VERTEX: import('@pixi/constants').PRECISION,
        /** @deprecated */
        PRECISION_FRAGMENT: import('@pixi/constants').PRECISION,
        /** @deprecated */
        GC_MODE: import('@pixi/constants').GC_MODES,
        /** @deprecated */
        GC_MAX_IDLE: number,
        /** @deprecated */
        GC_MAX_CHECK_COUNT: number,

        STRICT_TEXTURE_CACHE: boolean;
        PREFER_ENV: import('@pixi/constants').ENV;
    }
}
