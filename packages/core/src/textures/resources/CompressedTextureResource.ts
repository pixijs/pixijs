import { BlobResource } from './BlobResource';
import { INTERNAL_FORMATS } from '@pixi/constants';
import { Renderer } from '../../Renderer';
import { BaseTexture } from '../BaseTexture';
import { GLTexture } from '../GLTexture';

interface ICompressedTextureResourceOptions
{
    format: INTERNAL_FORMATS;
    width: number;
    height: number;
}

export class CompressedTextureResource extends BlobResource
{
    format: INTERNAL_FORMATS;
    width: number;
    height: number;

    private _extension: 's3tc' | 's3tc_sRGB' | 'atc' | 'astc' | 'etc' | 'etc1' | 'pvrtc';

    constructor(source: string | Uint8Array | Uint32Array, options: ICompressedTextureResourceOptions)
    {
        super(source, options);

        this.format = options.format;
        this._width = options.width;
        this._height = options.height;

        if (this.format >= 0x83F0 && this.format <= 0x83F3)
        {
            this._extension = 's3tc';
        }
        else if (this.format >= 0x9270 && this.format <= 0x9279)
        {
            this._extension = 'etc';
        }
        else if (this.format >= 0x8C00 && this.format <= 0x8C03)
        {
            this._extension = 'pvrtc';
        }
        else if (this.format >= 0x8D64)
        {
            this._extension = 'etc1';
        }
        else if (this.format >= 0x8C92 && this.format <= 0x87EE)
        {
            this._extension = 'atc';
        }
        else
        {
            throw new Error('Invalid (compressed) texture format given!');
        }
    }

    upload(renderer: Renderer, _texture: BaseTexture, _glTexture: GLTexture): boolean
    {
        const gl = renderer.gl;
        const extension = renderer.context.extensions[this._extension];

        if (!extension)
        {
            throw new Error(`${this._extension} textures are not supported on the current machine`);
        }
        if (!this.loaded)
        {
            return false;
        }

        gl.compressedTexImage2D(gl.TEXTURE_2D, 0, this.format, this._width, this._height, 0, this.data);

        return true;
    }
}
