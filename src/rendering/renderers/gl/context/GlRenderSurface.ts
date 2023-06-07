import type { ICanvas } from '../../../../settings/adapter/ICanvas';
import type { GlRenderingContext } from './GlRenderingContext';
import type { WebGLExtensions } from './WebGLExtensions';

let UID = 0;

export class GlRenderSurface
{
    gl: GlRenderingContext;
    extensions: WebGLExtensions;
    uid = UID++;

    element: ICanvas;

    initFromCanvas(element: ICanvas): void
    {
        this.element = element;

        const gl = element.getContext('webgl2', {
        }) as GlRenderingContext;

        this.extensions = {
            anisotropicFiltering: gl.getExtension('EXT_texture_filter_anisotropic'),
            floatTextureLinear: gl.getExtension('OES_texture_float_linear'),

            s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
            s3tc_sRGB: gl.getExtension('WEBGL_compressed_texture_s3tc_srgb'), // eslint-disable-line camelcase
            etc: gl.getExtension('WEBGL_compressed_texture_etc'),
            etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
            pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc')
                || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
            atc: gl.getExtension('WEBGL_compressed_texture_atc'),
            astc: gl.getExtension('WEBGL_compressed_texture_astc'),
            colorBufferFloat: gl.getExtension('EXT_color_buffer_float'),
        };

        this.gl = gl;
    }
}
