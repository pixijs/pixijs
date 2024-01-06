import type { TextureSource } from '../../../shared/texture/sources/TextureSource';
import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlTexture } from '../GlTexture';

export interface GLTextureUploader
{
    id: string;
    upload(source: TextureSource, glTexture: GlTexture, gl: GlRenderingContext, webGLVersion: number): void;
}
