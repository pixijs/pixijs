/* eslint-disable camelcase */
export interface WEBGL_compressed_texture_pvrtc
{
    COMPRESSED_RGB_PVRTC_4BPPV1_IMG: number;
    COMPRESSED_RGBA_PVRTC_4BPPV1_IMG: number;
    COMPRESSED_RGB_PVRTC_2BPPV1_IMG: number;
    COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: number;
}
export interface WEBGL_compressed_texture_etc
{
    COMPRESSED_R11_EAC: number;
    COMPRESSED_SIGNED_R11_EAC: number;
    COMPRESSED_RG11_EAC: number;
    COMPRESSED_SIGNED_RG11_EAC: number;
    COMPRESSED_RGB8_ETC2: number;
    COMPRESSED_RGBA8_ETC2_EAC: number;
    COMPRESSED_SRGB8_ETC2: number;
    COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: number;
    COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
}
export interface WEBGL_compressed_texture_etc1
{
    COMPRESSED_RGB_ETC1_WEBGL: number;
}
export interface WEBGL_compressed_texture_atc
{
    COMPRESSED_RGB_ATC_WEBGL: number;
    COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL: number;
    COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL: number;
}

export interface EXT_texture_compression_bptc
{
    COMPRESSED_RGBA_BPTC_UNORM_EXT: number;
    COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT: number;
    COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT: number;
    COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT: number;
}

export interface EXT_texture_compression_rgtc
{
    COMPRESSED_RED_RGTC1_EXT: number;
    COMPRESSED_SIGNED_RED_RGTC1_EXT: number;
    COMPRESSED_RED_GREEN_RGTC2_EXT: number;
    COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT: number;
}

export interface WebGLExtensions
{
    drawBuffers?: WEBGL_draw_buffers;
    depthTexture?: OES_texture_float;
    loseContext?: WEBGL_lose_context;
    vertexArrayObject?: OES_vertex_array_object;
    anisotropicFiltering?: EXT_texture_filter_anisotropic;
    uint32ElementIndex?: OES_element_index_uint;
    floatTexture?: OES_texture_float;
    floatTextureLinear?: OES_texture_float_linear;
    textureHalfFloat?: OES_texture_half_float;
    textureHalfFloatLinear?: OES_texture_half_float_linear;
    colorBufferFloat?: EXT_color_buffer_float;
    vertexAttribDivisorANGLE?: ANGLE_instanced_arrays;

    s3tc?: WEBGL_compressed_texture_s3tc;
    s3tc_sRGB?: WEBGL_compressed_texture_s3tc_srgb;
    etc?: WEBGL_compressed_texture_etc;
    etc1?: WEBGL_compressed_texture_etc1;
    pvrtc?: WEBGL_compressed_texture_pvrtc;
    atc?: WEBGL_compressed_texture_atc;
    astc?: WEBGL_compressed_texture_astc;
    bptc?: EXT_texture_compression_bptc;
    rgtc?: EXT_texture_compression_rgtc;

    // webgl1 EXT_sRGB
    srgb?: EXT_sRGB;

}
/* eslint-enable camelcase */
