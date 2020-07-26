import { resources, BaseTexture, Texture } from '@pixi/core';
import { Resource } from 'resource-loader';
import type { ILoaderResource } from './LoaderResource';

import { TYPES, INTERNAL_FORMAT_TO_BYTES_PER_PIXEL, FORMATS } from '@pixi/constants';

Resource.setExtensionXhrType('ktx', Resource.XHR_RESPONSE_TYPE.BUFFER);

/**
 * The 12-byte KTX file identifier
 *
 * @see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/#2.1
 * @internal
 */
const FILE_IDENTIFIER = [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A];

/**
 * The value stored in the "endiannness" field.
 *
 * @see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/#2.2
 * @internal
 */
const ENDIANNESS = 0x04030201;

/**
 * Byte offsets of the KTX file header fields
 */
const KTX_FIELDS = {
    FILE_IDENTIFIER: 0,
    ENDIANNESS: 12,
    GL_TYPE: 16,
    GL_TYPE_SIZE: 20,
    GL_FORMAT: 24,
    GL_INTERNAL_FORMAT: 28,
    GL_BASE_INTERNAL_FORMAT: 32,
    PIXEL_WIDTH: 36,
    PIXEL_HEIGHT: 40,
    PIXEL_DEPTH: 44,
    NUMBER_OF_ARRAY_ELEMENTS: 48,
    NUMBER_OF_FACES: 52,
    NUMBER_OF_MIPMAP_LEVELS: 56,
    BYTES_OF_KEY_VALUE_DATA: 60
};

/**
 * Byte size of the file header fields in {@code KTX_FIELDS}
 */
const FILE_HEADER_SIZE = 64;

/**
 * Maps {@link PIXI.TYPES} to the bytes taken per component, excluding those ones that are bit-fields.
 */
export const TYPES_TO_BYTES_PER_COMPONENT: { [id: number]: number } = {
    [TYPES.UNSIGNED_BYTE]: 1,
    [TYPES.UNSIGNED_SHORT]: 2,
    [TYPES.FLOAT]: 4,
    [TYPES.HALF_FLOAT]: 8
};

/**
 * Number of components in each {@link PIXI.FORMATS}
 */
export const FORMATS_TO_COMPONENTS: { [id: number]: number } = {
    [FORMATS.RGBA]: 4,
    [FORMATS.RGB]: 3,
    [FORMATS.LUMINANCE]: 1,
    [FORMATS.LUMINANCE_ALPHA]: 2,
    [FORMATS.ALPHA]: 1
};

/**
 * Number of bytes per pixel in bit-field types in {@link PIXI.TYPES}
 */
export const TYPES_TO_BYTES_PER_PIXEL: { [id: number]: number } = {
    [TYPES.UNSIGNED_SHORT_4_4_4_4]: 2,
    [TYPES.UNSIGNED_SHORT_5_5_5_1]: 2,
    [TYPES.UNSIGNED_SHORT_5_6_5]: 2
};

/**
 * Loader plugin for handling KTX texture container files.
 *
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export class KTXLoader
{
    /**
     * Called after a KTX file is loaded.
     *
     * This will parse the KTX file header and add a {@code BaseTexture} to the texture
     * cache.
     *
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    public static use(resource: ILoaderResource, next: (...args: any[]) => void): void
    {
        if (resource.extension === 'ktx' && resource.data)
        {
            KTXLoader.parse(resource.url, resource.data);
        }

        next();
    }

    /**
     * Parses the KTX file header, generates base-textures, and puts them into the texture
     * cache.
     */
    private static parse(url: string, arrayBuffer: ArrayBuffer): void
    {
        const dataView = new DataView(arrayBuffer);

        if (!KTXLoader.validate(url, dataView))
        {
            return;
        }

        const littleEndian = dataView.getUint32(KTX_FIELDS.ENDIANNESS, true) === ENDIANNESS;
        const glType = dataView.getUint32(KTX_FIELDS.GL_TYPE, littleEndian);
        // const glTypeSize = dataView.getUint32(KTX_FIELDS.GL_TYPE_SIZE, littleEndian);
        const glFormat = dataView.getUint32(KTX_FIELDS.GL_FORMAT, littleEndian);
        const glInternalFormat = dataView.getUint32(KTX_FIELDS.GL_INTERNAL_FORMAT, littleEndian);
        const pixelWidth = dataView.getUint32(KTX_FIELDS.PIXEL_WIDTH, littleEndian);
        const pixelHeight = dataView.getUint32(KTX_FIELDS.PIXEL_HEIGHT, littleEndian) || 1;// "pixelHeight = 0" -> "1"
        const pixelDepth = dataView.getUint32(KTX_FIELDS.PIXEL_DEPTH, littleEndian) || 1;// ^^
        const numberOfArrayElements = dataView.getUint32(KTX_FIELDS.NUMBER_OF_ARRAY_ELEMENTS, littleEndian) || 1;// ^^
        const numberOfFaces = dataView.getUint32(KTX_FIELDS.NUMBER_OF_FACES, littleEndian);
        const numberOfMipmapLevels = dataView.getUint32(KTX_FIELDS.NUMBER_OF_MIPMAP_LEVELS, littleEndian);
        const bytesOfKeyValueData = dataView.getUint32(KTX_FIELDS.BYTES_OF_KEY_VALUE_DATA, littleEndian);

        // Whether the platform architecture is little endian. If littleEndian !== platformLittleEndian, then the
        // file contents must be endian-converted!
        // TODO: Endianness conversion
        // const platformLittleEndian = new Uint8Array((new Uint32Array([ENDIANNESS])).buffer)[0] === 0x01;

        if (pixelHeight === 0 || pixelDepth !== 1)
        {
            throw new Error('Only 2D textures are supported');
        }
        if (numberOfFaces !== 1)
        {
            throw new Error('CubeTextures are not supported by KTXLoader yet!');
        }
        if (numberOfMipmapLevels !== 1)
        {
            throw new Error('Mipmaps not supported yet');
        }
        if (numberOfArrayElements !== 1)
        {
            // TODO: Support splitting array-textures into multiple BaseTextures
            throw new Error('WebGL does not support array textures');
        }

        const alignedWidth = (pixelWidth + 3) & ~3;
        const alignedHeight = (pixelHeight + 3) & ~3;
        const imageBuffers = new Array(numberOfArrayElements);
        let imagePixels = pixelWidth * pixelHeight;

        if (glType === 0)
        {
            // Align to 16 pixels (4x4 blocks)
            imagePixels = alignedWidth * alignedHeight;
        }

        let imagePixelByteSize: number;

        if (glType !== 0)
        {
            // Uncompressed texture format
            if (TYPES_TO_BYTES_PER_COMPONENT[glType])
            {
                imagePixelByteSize = TYPES_TO_BYTES_PER_COMPONENT[glType] * FORMATS_TO_COMPONENTS[glFormat];
            }
            else
            {
                imagePixelByteSize = TYPES_TO_BYTES_PER_PIXEL[glType];
            }
        }
        else
        {
            imagePixelByteSize = INTERNAL_FORMAT_TO_BYTES_PER_PIXEL[glInternalFormat];
        }

        if (imagePixelByteSize === undefined)
        {
            throw new Error('Unable to resolve the pixel format stored in the *.ktx file!');
        }

        const imageByteSize = imagePixels * imagePixelByteSize;
        let mipByteSize = imageByteSize;
        let imageOffset = FILE_HEADER_SIZE + bytesOfKeyValueData;

        for (let mipmapLevel = 0; mipmapLevel < numberOfMipmapLevels; mipmapLevel++)
        {
            const imageSize = dataView.getUint32(imageOffset, littleEndian);
            let elementOffset = imageOffset + 4;

            for (let arrayElement = 0; arrayElement < numberOfArrayElements; arrayElement++)
            {
                // TODO: Maybe support 3D textures? :-)
                // for (let zSlice = 0; zSlice < pixelDepth; zSlice)

                imageBuffers[arrayElement] = new Uint8Array(arrayBuffer, elementOffset, mipByteSize);
                elementOffset += mipByteSize;
            }

            // HINT: Aligns to 4-byte boundary after jumping imageSize (in lieu of mipPadding)
            imageOffset += imageSize + 4;// (+4 to jump the imageSize field itself)
            imageOffset = imageOffset % 4 !== 0 ? imageOffset + 4 - (imageOffset % 4) : imageOffset;

            // Each mipmap level is 4-times smaller?
            mipByteSize /= 4;
        }

        let imageResources: resources.Resource[];

        if (glType !== 0)
        {
            throw new Error('TODO: Uncompressed');
        }
        else
        {
            imageResources = imageBuffers.map((buffer) => new resources.CompressedTextureResource(buffer, {
                format: glInternalFormat,
                width: alignedWidth,
                height: alignedHeight
            }));
        }

        // Map each Resource to a BaseTexture & a Texture, and add them into the texture cache
        imageResources.forEach((resource, i) =>
        {
            const baseTexture = new BaseTexture(resource);
            const cacheID = `${url}-${i + 1}`;

            BaseTexture.addToCache(baseTexture, cacheID);
            Texture.addToCache(new Texture(baseTexture), cacheID);

            if (i === 0)
            {
                BaseTexture.addToCache(baseTexture, url);
                Texture.addToCache(new Texture(baseTexture), url);
            }
        });
    }

    /**
     * Checks whether the arrayBuffer contains a valid *.ktx file.
     */
    private static validate(url: string, dataView: DataView): boolean
    {
        // NOTE: Do not optimize this into 3 32-bit integer comparision because the endianness
        // of the data is not specified.
        for (let i = 0; i < FILE_IDENTIFIER.length; i++)
        {
            if (dataView.getUint8(i) !== FILE_IDENTIFIER[i])
            {
                console.error(`${url} is not a valid *.ktx file!`);

                return false;
            }
        }

        return true;
    }
}
