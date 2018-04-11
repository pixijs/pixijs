/* eslint-disable camelcase,no-unused-vars */
import Resource from './Resource';

/**
 * Provides support for compressed textures, these textures
 * are much faster to upload to the GPU but are many more
 * device formats to support.
 * @see {@link http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/ DXT Format}
 * @see {@link http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_atc/ ATC Format}
 * @see {@link https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/ ASTC Format}
 * @see {@link http://msdn.microsoft.com/en-us/library/bb943991.aspx/ DDS Format}
 * @see {@link http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/ PVR Format}
 * @see {@link http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/ ETC1 Format}
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 */
export default class CompressedResource extends Resource
{
    /**
     * @param {ArrayBuffer} source - Source
     * @param {object} options Options
     * @param {number} options.width - Width of the texture
     * @param {number} options.height - Height of the texture
     * @param {string} options.type - type of the file: DDS, ASTC, or PVR
     * @param {number} options.levels -  Number of mip levels
     * @param {number} options.internalFormat - internal format of texture
     * @param {boolean} [options.preserveSource=false] if false, data will be removed after the upload
     */
    constructor(source, options)
    {
        const { width, height, type, levels, internalFormat, preserveSource } = options || {};

        super(width, height);

        if (!width || !height)
        {
            throw new Error('CompressedResource width or height invalid');
        }

        /**
         * Compressed texture data, may be null after texture gets uploaded
         * @member {ArrayBuffer}
         */
        this.data = source;

        /**
         * Type: DDS, ASTC, or PVR
         * @member {string}
         */
        this.type = type;

        /**
         * Number of mip levels
         * @member {number}
         */
        this.levels = levels;

        /**
         * Internal format of texture
         * @member {number}
         */
        this.internalFormat = internalFormat;

        /**
         * `false` then data will be removed after the upload
         * @member {boolean}
         * @default false
         */
        this.preserveSource = preserveSource || false;
    }

    static test(source, extension)
    {
        return CompressedResource.TYPES.indexOf(extension) > -1;
    }

    /**
     * Bind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    bind(baseTexture)
    {
        baseTexture.premultiplyAlpha = false;
        baseTexture.type = this.type;
        super.bind(baseTexture);
    }

    /**
     * Upload the texture to the GPU.
     * @param {PIXI.Renderer} renderer Upload to the renderer
     * @param {PIXI.BaseTexture} baseTexture Reference to parent texture
     * @param {PIXI.glCore.GLTexture} glTexture Reference
     */
    upload(renderer, baseTexture, glTexture)
    {
        const gl = renderer.gl;

        let width = this._width;
        let height = this._height;
        const levels = this.levels;
        let offset = 0;

        glTexture.width = width;
        glTexture.height = height;

        // Loop through each mip level of compressed texture data provided and upload it to the given texture.
        for (let i = 0; i < this.levels; ++i)
        {
            // Determine how big this level of compressed texture data is in bytes.
            const levelSize = textureLevelSize(this.internalFormat, width, height);

            // Get a view of the bytes for this level of DXT data.
            const dxtLevel = new Uint8Array(this.data.buffer, this.data.byteOffset + offset, levelSize);

            // Upload!
            gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, width, height, 0, dxtLevel);

            // The next mip level will be half the height and width of this one.
            width = width >> 1;

            if (width < 1)
            {
                width = 1;
            }
            height = height >> 1;
            if (height < 1)
            {
                height = 1;
            }
            // Advance the offset into the compressed texture data past the current mip level's data.
            offset += levelSize;
        }

        // Cleaning the data to save memory.
        if (!this.preserveSource)
        {
            this.data = null;
        }

        return true;
    }

    /**
     * Set props of compressed texture
     * @param {PIXI.Renderer} renderer Upload to the renderer
     * @param {PIXI.BaseTexture} baseTexture Reference to parent texture
     * @param {PIXI.glCore.GLTexture} glTexture Reference
     */
    style(renderer, baseTexture, glTexture)
    {
        const gl = renderer.gl;
        const levels = this.levels;

        // We can't use gl.generateMipmaps with compressed textures, so only use
        // mipmapped filtering if the compressed texture data contained mip levels.
        if (levels > 1)
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        }
        else
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        return true;
    }

    /**
     * Destroy and don't use after this
     * @override
     */
    dispose()
    {
        this.data = null;
    }

    destroy()
    {
        this.dispose();
        super.destroy();
    }

    /**
     * Reads compressed resource from arrayBuffer
     *
     * @static
     * @param {ArrayBuffer} arrayBuffer - The file
     * @returns {PIXI.resources.CompressedResource} resource
     */
    static fromArrayBuffer(arrayBuffer)
    {
        const head = new Uint8Array(arrayBuffer, 0, 3);

        if (head[0] === 'DDS'.charCodeAt(0) && head[1] === 'DDS'.charCodeAt(1) && head[2] === 'DDS'.charCodeAt(2))
        {
            return loadDDS(arrayBuffer);
        }
        else if (head[0] === 'PVR'.charCodeAt(0) && head[1] === 'PVR'.charCodeAt(1) && head[2] === 'PVR'.charCodeAt(2))
        {
            return loadPVR(arrayBuffer);
        }
        else if (head[0] === 0x13 && head[1] === 0xab && head[2] === 0xa1)
        {
            return loadASTC(arrayBuffer);
        }

        throw new Error(`Compressed texture format is not recognized`);
    }
}

/**
 * List of file extensions supported by CompressedResource.
 * @constant
 * @member {Array<string>}
 * @static
 * @readonly
 */
CompressedResource.TYPES = ['dds', 'pvr', 'etc1', 'astc'];

// DXT constants and utilites //

// Utility functions
// Builds a numeric code for a given fourCC string
function fourCCToInt32(value)
{
    return value.charCodeAt(0)
        + (value.charCodeAt(1) << 8)
        + (value.charCodeAt(2) << 16)
        + (value.charCodeAt(3) << 24);
}

// Turns a fourCC numeric code into a string
function int32ToFourCC(value)
{
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    );
}

// DXT formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

// ATC formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_atc/
const COMPRESSED_RGB_ATC_WEBGL = 0x8C92;
const COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93;
const COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE;

// ASTC formats
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
const COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1;
const COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2;
const COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3;
const COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4;
const COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5;
const COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6;
const COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7;
const COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8;
const COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9;
const COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA;
const COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB;
const COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC;
const COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD;

/*
 No support for SRGB formats
 - no way how to determine RGB vs SRGB from ASTC file
 */
const COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 0x93D0;
const COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 0x93D1;
const COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 0x93D2;
const COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 0x93D3;
const COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 0x93D4;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 0x93D5;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 0x93D6;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 0x93D7;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 0x93D8;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 0x93D9;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 0x93DA;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 0x93DB;
const COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 0x93DC;
const COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 0x93DD;

// DXT values and structures referenced from:
// http://msdn.microsoft.com/en-us/library/bb943991.aspx/
const DDS_MAGIC = 0x20534444;
const DDSD_MIPMAPCOUNT = 0x20000;
const DDPF_FOURCC = 0x4;

const DDS_HEADER_LENGTH = 31; // The header length in 32 bit ints.

// Offsets into the header array.
const DDS_HEADER_MAGIC = 0;

const DDS_HEADER_SIZE = 1;
const DDS_HEADER_FLAGS = 2;
const DDS_HEADER_HEIGHT = 3;
const DDS_HEADER_WIDTH = 4;

const DDS_HEADER_MIPMAPCOUNT = 7;

const DDS_HEADER_PF_FLAGS = 20;
const DDS_HEADER_PF_FOURCC = 21;

// FourCC format identifiers.
const FOURCC_DXT1 = fourCCToInt32('DXT1');
const FOURCC_DXT3 = fourCCToInt32('DXT3');
const FOURCC_DXT5 = fourCCToInt32('DXT5');

const FOURCC_ATC = fourCCToInt32('ATC ');
const FOURCC_ATCA = fourCCToInt32('ATCA');
const FOURCC_ATCI = fourCCToInt32('ATCI');

// PVR constants //

// PVR formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/
const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
const COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01;
const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
const COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03;

// ETC1 format, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/
const COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;

const PVR_FORMAT_2BPP_RGB = 0;
const PVR_FORMAT_2BPP_RGBA = 1;
const PVR_FORMAT_4BPP_RGB = 2;
const PVR_FORMAT_4BPP_RGBA = 3;
const PVR_FORMAT_ETC1 = 6;
const PVR_FORMAT_DXT1 = 7;
const PVR_FORMAT_DXT3 = 9;
const PVR_FORMAT_DXT5 = 5;

const PVR_HEADER_LENGTH = 13; // The header length in 32 bit ints.
const PVR_MAGIC = 0x03525650; // 0x50565203;

// Offsets into the header array.
const PVR_HEADER_MAGIC = 0;
const PVR_HEADER_FORMAT = 2;
const PVR_HEADER_HEIGHT = 6;
const PVR_HEADER_WIDTH = 7;
const PVR_HEADER_MIPMAPCOUNT = 11;
const PVR_HEADER_METADATA = 12;

// ASTC constants //

const ASTC_HEADER_LENGTH = 16; // The header length in bytes.
const ASTC_MAGIC = 0x5ca1ab13;

// Calcualates the size of a compressed texture level in bytes
function textureLevelSize(format, width, height)
{
    switch (format)
    {
        case COMPRESSED_RGB_S3TC_DXT1_EXT:
        case COMPRESSED_RGB_ATC_WEBGL:
        case COMPRESSED_RGB_ETC1_WEBGL:
            return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;

        case COMPRESSED_RGBA_S3TC_DXT3_EXT:
        case COMPRESSED_RGBA_S3TC_DXT5_EXT:
        case COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL:
        case COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL:
            return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;

        case COMPRESSED_RGB_PVRTC_4BPPV1_IMG:
        case COMPRESSED_RGBA_PVRTC_4BPPV1_IMG:
            return Math.floor(((Math.max(width, 8) * Math.max(height, 8) * 4) + 7) / 8);

        case COMPRESSED_RGB_PVRTC_2BPPV1_IMG:
        case COMPRESSED_RGBA_PVRTC_2BPPV1_IMG:
            return Math.floor(((Math.max(width, 16) * Math.max(height, 8) * 2) + 7) / 8);

        // ASTC formats, https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
        case COMPRESSED_RGBA_ASTC_4x4_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:
            return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
        case COMPRESSED_RGBA_ASTC_5x4_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:
            return Math.floor((width + 4) / 5) * Math.floor((height + 3) / 4) * 16;
        case COMPRESSED_RGBA_ASTC_5x5_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:
            return Math.floor((width + 4) / 5) * Math.floor((height + 4) / 5) * 16;
        case COMPRESSED_RGBA_ASTC_6x5_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:
            return Math.floor((width + 5) / 6) * Math.floor((height + 4) / 5) * 16;
        case COMPRESSED_RGBA_ASTC_6x6_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:
            return Math.floor((width + 5) / 6) * Math.floor((height + 5) / 6) * 16;
        case COMPRESSED_RGBA_ASTC_8x5_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:
            return Math.floor((width + 7) / 8) * Math.floor((height + 4) / 5) * 16;
        case COMPRESSED_RGBA_ASTC_8x6_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:
            return Math.floor((width + 7) / 8) * Math.floor((height + 5) / 6) * 16;
        case COMPRESSED_RGBA_ASTC_8x8_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:
            return Math.floor((width + 7) / 8) * Math.floor((height + 7) / 8) * 16;
        case COMPRESSED_RGBA_ASTC_10x5_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:
            return Math.floor((width + 9) / 10) * Math.floor((height + 4) / 5) * 16;
        case COMPRESSED_RGBA_ASTC_10x6_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:
            return Math.floor((width + 9) / 10) * Math.floor((height + 5) / 6) * 16;
        case COMPRESSED_RGBA_ASTC_10x8_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:
            return Math.floor((width + 9) / 10) * Math.floor((height + 7) / 8) * 16;
        case COMPRESSED_RGBA_ASTC_10x10_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:
            return Math.floor((width + 9) / 10) * Math.floor((height + 9) / 10) * 16;
        case COMPRESSED_RGBA_ASTC_12x10_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:
            return Math.floor((width + 11) / 12) * Math.floor((height + 9) / 10) * 16;
        case COMPRESSED_RGBA_ASTC_12x12_KHR:
        case COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:
            return Math.floor((width + 11) / 12) * Math.floor((height + 11) / 12) * 16;

        default:
            return 0;
    }
}

/**
 * @param {ArrayBuffer} arrayBuffer input
 */
function loadDDS(arrayBuffer)
{
    const header = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);

    // Do some sanity checks to make sure this is a valid DDS file.
    if (header[DDS_HEADER_MAGIC] !== DDS_MAGIC)
    {
        throw new Error('Invalid magic number in DDS header');
    }

    if ((header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC) === 0)
    {
        throw new Error('Unsupported format, must contain a FourCC code');
    }

    // Determine what type of compressed data the file contains.
    const fourCC = header[DDS_HEADER_PF_FOURCC];
    let internalFormat;

    switch (fourCC)
    {
        case FOURCC_DXT1:
            internalFormat = COMPRESSED_RGB_S3TC_DXT1_EXT;
            break;
        case FOURCC_DXT3:
            internalFormat = COMPRESSED_RGBA_S3TC_DXT3_EXT;
            break;
        case FOURCC_DXT5:
            internalFormat = COMPRESSED_RGBA_S3TC_DXT5_EXT;
            break;
        case FOURCC_ATC:
            internalFormat = COMPRESSED_RGB_ATC_WEBGL;
            break;
        case FOURCC_ATCA:
            internalFormat = COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL;
            break;
        case FOURCC_ATCI:
            internalFormat = COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL;
            break;
        default:
            throw new Error(`Unsupported FourCC code: ${int32ToFourCC(fourCC)}$`);
    }

    // Determine how many mipmap levels the file contains.
    let levels = 1;

    if (header[DDS_HEADER_FLAGS] & DDSD_MIPMAPCOUNT)
    {
        levels = Math.max(1, header[DDS_HEADER_MIPMAPCOUNT]);
    }

    // Gather other basic metrics and a view of the raw the DXT data.
    const width = header[DDS_HEADER_WIDTH];
    const height = header[DDS_HEADER_HEIGHT];
    const dataOffset = header[DDS_HEADER_SIZE] + 4;
    const dxtData = new Uint8Array(arrayBuffer, dataOffset);

    return new CompressedResource(dxtData, {
        type: 'DDS',
        width,
        height,
        levels,
        internalFormat,
    });
}

/**
 * @param {ArrayBuffer} arrayBuffer input
 */
function loadASTC(arrayBuffer)
{
    // Get a view of the arrayBuffer that represents the DDS header.

    const header = new Int8Array(arrayBuffer, 0, ASTC_HEADER_LENGTH);
    const magic = new Uint32Array(arrayBuffer.slice(0, 4));

    // Do some sanity checks to make sure this is a valid DDS file.
    if (magic !== ASTC_MAGIC) // 0x5ca1ab13
    {
        throw new Error('Invalid magic number in ASTC header');
    }

    // Determine what type of compressed data the file contains.
    const detectFormats = [COMPRESSED_RGBA_ASTC_4x4_KHR,
        COMPRESSED_RGBA_ASTC_5x4_KHR,
        COMPRESSED_RGBA_ASTC_5x5_KHR,
        COMPRESSED_RGBA_ASTC_6x5_KHR,
        COMPRESSED_RGBA_ASTC_6x6_KHR,
        COMPRESSED_RGBA_ASTC_8x5_KHR,
        COMPRESSED_RGBA_ASTC_8x6_KHR,
        COMPRESSED_RGBA_ASTC_8x8_KHR,
        COMPRESSED_RGBA_ASTC_10x5_KHR,
        COMPRESSED_RGBA_ASTC_10x6_KHR,
        COMPRESSED_RGBA_ASTC_10x8_KHR,
        COMPRESSED_RGBA_ASTC_10x10_KHR,
        COMPRESSED_RGBA_ASTC_12x10_KHR,
        COMPRESSED_RGBA_ASTC_12x12_KHR];

    // https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_compressed_texture_astc
    const dataSize = arrayBuffer.byteLength - ASTC_HEADER_LENGTH; // loaded image data payload size in bytes

    // retieve width and height of texture from the astc file header
    const widthBytes = new Uint8Array([header[7], header[8], header[9], 0]);
    const heightBytes = new Uint8Array([header[10], header[11], header[12], 0]);
    const width = new Uint32Array(widthBytes.buffer)[0];
    const height = new Uint32Array(heightBytes.buffer)[0];

    // detect format from data size
    let internalFormat = 0;

    for (let i = 0; i < detectFormats.length; i++)
    {
        if (dataSize === textureLevelSize(detectFormats[i], width, height))
        {
            internalFormat = detectFormats[i];
            break;
        }
    }
    if (internalFormat === 0)
    {
        throw new Error('Unable to autodetect ASTC format; file size not right');
    }

    const astcData = new Uint8Array(arrayBuffer, ASTC_HEADER_LENGTH, dataSize);

    const levels = 1;

    return new CompressedResource(astcData, {
        type: 'ASTC', width, height, levels, internalFormat,
    });
}

/**
 * @param {ArrayBuffer} arrayBuffer input
 */
function loadPVR(arrayBuffer)
{
    // Get a view of the arrayBuffer that represents the DDS header.
    const header = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);

    // Do some sanity checks to make sure this is a valid DDS file.
    if (header[PVR_HEADER_MAGIC] !== PVR_MAGIC)
    {
        throw new Error('Invalid magic number in PVR header');
    }

    // Determine what type of compressed data the file contains.
    const format = header[PVR_HEADER_FORMAT];
    let internalFormat;

    switch (format)
    {
        case PVR_FORMAT_2BPP_RGB:
            internalFormat = COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
            break;
        case PVR_FORMAT_2BPP_RGBA:
            internalFormat = COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
            break;
        case PVR_FORMAT_4BPP_RGB:
            internalFormat = COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
            break;
        case PVR_FORMAT_4BPP_RGBA:
            internalFormat = COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
            break;
        case PVR_FORMAT_ETC1:
            internalFormat = COMPRESSED_RGB_ETC1_WEBGL;
            break;
        case PVR_FORMAT_DXT1:
            internalFormat = COMPRESSED_RGB_S3TC_DXT1_EXT;
            break;
        case PVR_FORMAT_DXT3:
            internalFormat = COMPRESSED_RGBA_S3TC_DXT3_EXT;
            break;
        case PVR_FORMAT_DXT5:
            internalFormat = COMPRESSED_RGBA_S3TC_DXT5_EXT;
            break;
        default:
            throw new Error(`Unsupported PVR format: ${format}`);
    }

    // Gather other basic metrics and a view of the raw the DXT data.
    const width = header[PVR_HEADER_WIDTH];
    const height = header[PVR_HEADER_HEIGHT];
    const levels = header[PVR_HEADER_MIPMAPCOUNT];
    const dataOffset = header[PVR_HEADER_METADATA] + 52;
    const pvrtcData = new Uint8Array(arrayBuffer, dataOffset);

    return this.init(pvrtcData, {
        type: 'PVR', width, height, levels, internalFormat,
    });
}
