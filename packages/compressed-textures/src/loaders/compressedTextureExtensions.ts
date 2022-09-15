// Missing typings? - https://github.com/microsoft/TypeScript/issues/39655
/** Compressed texture extensions */
/* eslint-disable camelcase */
export type CompressedTextureExtensions = {
    s3tc?: WEBGL_compressed_texture_s3tc,
    s3tc_sRGB: WEBGL_compressed_texture_s3tc_srgb,
    etc: any,
    etc1: any,
    pvrtc: any,
    atc: any,
    astc: WEBGL_compressed_texture_astc
};
export type CompressedTextureExtensionRef = keyof CompressedTextureExtensions;
/* eslint-enable camelcase */
