import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';

/**
 * Builds a lookup table that maps Pixi's texture view dimension to the appropriate WebGL texture target.
 *
 * This is about how the texture is *bound/viewed* in shaders, not about how pixel data is uploaded.
 * @param gl - WebGL context.
 * @internal
 */
export function mapViewDimensionToGlTarget(
    gl: GlRenderingContext,
): Record<TextureSource['viewDimension'], number | null>
{
    return {
        '2d': gl.TEXTURE_2D,
        cube: gl.TEXTURE_CUBE_MAP,
        '1d': null,
        // WebGL2 only
        '3d': (gl as any)?.TEXTURE_3D || null,
        '2d-array': (gl as any)?.TEXTURE_2D_ARRAY || null,
        'cube-array': (gl as any)?.TEXTURE_CUBE_MAP_ARRAY || null,
    };
}

