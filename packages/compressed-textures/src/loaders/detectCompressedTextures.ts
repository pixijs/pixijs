import { extensions as ext, ExtensionType, settings } from '@pixi/core';

import type { FormatDetectionParser } from '@pixi/assets';
import type { CompressedTextureExtensionRef, CompressedTextureExtensions } from './compressedTextureExtensions';

let storedGl: WebGLRenderingContext;
let extensions: Partial<CompressedTextureExtensions>;

function getCompressedTextureExtensions()
{
    extensions = {
        s3tc: storedGl.getExtension('WEBGL_compressed_texture_s3tc'),
        s3tc_sRGB: storedGl.getExtension('WEBGL_compressed_texture_s3tc_srgb'), /* eslint-disable-line camelcase */
        etc: storedGl.getExtension('WEBGL_compressed_texture_etc'),
        etc1: storedGl.getExtension('WEBGL_compressed_texture_etc1'),
        pvrtc: storedGl.getExtension('WEBGL_compressed_texture_pvrtc')
            || storedGl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
        atc: storedGl.getExtension('WEBGL_compressed_texture_atc'),
        astc: storedGl.getExtension('WEBGL_compressed_texture_astc')
    } as Partial<CompressedTextureExtensions>;
}

export const detectCompressedTextures = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 2,
    },
    test: async (): Promise<boolean> =>
    {
        // Auto-detect WebGL compressed-texture extensions
        const canvas = settings.ADAPTER.createCanvas();
        const gl = canvas.getContext('webgl');

        if (!gl)
        {
            if (process.env.DEBUG)
            {
                console.warn('WebGL not available for compressed textures.');
            }

            return false;
        }

        storedGl = gl;

        return true;
    },
    add: async (formats: string[]): Promise<string[]> =>
    {
        if (!extensions) getCompressedTextureExtensions();

        const textureFormats = [];

        // Assign all available compressed-texture formats
        for (const extensionName in extensions)
        {
            const extension = extensions[extensionName as CompressedTextureExtensionRef];

            if (!extension)
            {
                continue;
            }

            textureFormats.push(extensionName);
        }

        return [...textureFormats, ...formats];
    },
    remove: async (formats: string[]): Promise<string[]> =>
    {
        if (!extensions) getCompressedTextureExtensions();

        return formats.filter((f) => !(f in extensions));
    },
} as FormatDetectionParser;

ext.add(detectCompressedTextures);
