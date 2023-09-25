import {
    compareModeToGlCompare,
    mipmapScaleModeToGlFilter,
    scaleModeToGlFilter,
    wrapModeToGlAddress
} from './pixiToGlMaps';

import type { TextureStyle } from '../../../shared/texture/TextureStyle';

export function applyStyleParams(
    style: TextureStyle,
    gl: WebGL2RenderingContext,
    mipmaps: boolean,
    // eslint-disable-next-line camelcase
    anisotropicExt: EXT_texture_filter_anisotropic,
    glFunctionName: 'samplerParameteri' | 'texParameteri',
    firstParam: 3553 | WebGLSampler
)
{
    const castParam = firstParam as 3553;

    // 1. set the wrapping mode
    gl[glFunctionName](castParam, gl.TEXTURE_WRAP_S, wrapModeToGlAddress[style.addressModeU]);
    gl[glFunctionName](castParam, gl.TEXTURE_WRAP_T, wrapModeToGlAddress[style.addressModeV]);
    gl[glFunctionName](castParam, gl.TEXTURE_WRAP_R, wrapModeToGlAddress[style.addressModeW]);

    // 2. set the filtering mode
    gl[glFunctionName](castParam, gl.TEXTURE_MAG_FILTER, scaleModeToGlFilter[style.magFilter]);

    // assuming the currently bound texture is the one we want to set the filter for
    // the only smelly part of this code, WebGPU is much better here :P
    if (mipmaps)
    {
        const glFilterMode = mipmapScaleModeToGlFilter[style.minFilter][style.mipmapFilter];

        gl[glFunctionName](castParam, gl.TEXTURE_MIN_FILTER, glFilterMode);
    }

    else
    {
        gl[glFunctionName](castParam, gl.TEXTURE_MIN_FILTER, scaleModeToGlFilter[style.minFilter]);
    }

    // 3. set the anisotropy
    if (anisotropicExt && style.maxAnisotropy > 1)
    {
        const level = Math.min(style.maxAnisotropy, gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT));

        gl[glFunctionName](castParam, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
    }

    // 4. set the compare mode
    if (style.compare)
    {
        gl[glFunctionName](castParam, gl.TEXTURE_COMPARE_FUNC, compareModeToGlCompare[style.compare]);
    }
}
