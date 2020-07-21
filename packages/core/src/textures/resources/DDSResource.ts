import { BlobResource } from './BlobResource';
import { INTERNAL_FORMATS } from '@pixi/constants';
import { CompressedTextureResource } from './CompressedTextureResource';
import { Texture } from '../Texture';
import { GLTexture } from '../GLTexture';
import { Renderer } from '../../Renderer';
import { BaseTexture } from '../BaseTexture';

// DDS file format magic word
const DDS_MAGIC = 0x20534444;

// The header length in 32 bit ints.
const DDS_HEADER_LENGTH = 31;
const PF_LENGTH = 8;

const DDS_HEADER_SIZE = 1;
const DDS_HEADER_FLAGS = 2;
const DDS_HEADER_HEIGHT = 3;
const DDS_HEADER_WIDTH = 4;
const DDS_HEADER_PIXEL_FORMAT = 19;
const DDS_HEADER_MIPMAPCOUNT = 7;

const PF_FLAGS = 1;
const PF_FOURCC = 2;
const PF_RGB_BITCOUNT = 3;
const PF_RBIT_MASK = 4;

const DDSD_MIPMAPCOUNT = 0x20000;

const DDPF_FOURCC = 0x4;

// Four character codes for DXTn formats
const FOURCC_DXT1 = 0x31545844;
const FOURCC_DXT3 = 0x33545844;
const FOURCC_DXT5 = 0x35545844;

const FOURCC_TO_FORMAT: { [id: number]: number } = {
    [FOURCC_DXT1]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT,
    [FOURCC_DXT3]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT,
    [FOURCC_DXT5]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT
};

/**
 * @see https://docs.microsoft.com/en-us/windows/win32/direct3ddds/dx-graphics-dds-pguide
 */
export class DDSResource extends BlobResource
{
    textureArray: Array<CompressedTextureResource> = [];

    load(): Promise<Resource>
    {
        return super.load().then(() =>
        {
            this._parse(this.buffer.uint32View);
        })
            .then(() => this);
    }

    private _parse(data: Uint32Array): void
    {
        const arrayBuffer = data.buffer;
        const magicWord = data[0];

        if (magicWord !== DDS_MAGIC)
        {
            throw new Error('Invalid DDS file magic word');
        }

        const header = new Uint32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);

        const flags = header[DDS_HEADER_FLAGS];
        const height = header[DDS_HEADER_HEIGHT];
        const width = header[DDS_HEADER_WIDTH];
        const pixelFormat = new Uint32Array(arrayBuffer, DDS_HEADER_PIXEL_FORMAT * 4, PF_LENGTH);

        const formatFlags = pixelFormat[PF_FLAGS];

        const internalFormat = formatFlags & DDPF_FOURCC
            ? FOURCC_TO_FORMAT[pixelFormat[PF_FOURCC]]
            : FOURCC_TO_FORMAT[FOURCC_DXT1];

        if (!internalFormat)
        {
            throw new Error(`Unsupported format in DDS file: 0x${pixelFormat[PF_FOURCC].toString(16)}`);
        }

        const dataOffset = header[DDS_HEADER_SIZE] + 4;
        const texData = new Uint8Array(arrayBuffer, dataOffset);

        this._width = width;
        this._height = height;

        const alignedWidth = (width + 3) & ~3;
        const alignedHeight = (height + 3) & ~3;

        this.textureArray.push(new CompressedTextureResource(texData, {
            format: internalFormat,
            width: alignedWidth,
            height: alignedHeight
        }));
    }

    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
    {
        if (!this.textureArray.length)
        {
            return false;
        }

        this.textureArray[0].upload(renderer, baseTexture, glTexture);

        return true;
    }
}
