import { Buffer } from '../buffer/Buffer';
import { type BufferOption, ensureIsBuffer, isBufferOption } from './utils/ensureIsBuffer';

import type { VertexFormat } from './const';

export type IAttribute = Partial<Omit<Attribute, 'bufferIndex'>>;

export type ExtractedAttributeData = Omit<IAttribute, 'buffer'>;

/**
 * The attribute options used by the constructor for adding geometries attributes
 * extends {@link rendering.Attribute} but allows for the buffer to be a typed or number array
 * @memberof rendering
 */
export type AttributeOption = ExtractedAttributeData & { buffer?: BufferOption } | BufferOption | VertexFormat;

/**
 * Holds the information for a single attribute structure required to render geometry.
 *
 * This does not contain the actual data, but instead has a buffer id that maps to a {@link PIXI.Buffer}
 * This can include anything from positions, uvs, normals, colors etc.
 * @memberof PIXI
 */
export class Attribute
{
    /**
     * The buffer that this attributes data belongs.
     *
     * In case attribute is shared between multiple geometries,
     * it can be overriden by buffer in particular geometry instance
     */
    public buffer: Buffer;
    /** buffer index in geometry, used for sharing attribute array between geometries */
    public bufferIndex = -1;
    /** the format of the attribute */
    public format: VertexFormat;
    /** set where the shader location is for this attribute */
    public location?: number;
    /** the stride of the data in the buffer*/
    public stride: number;
    /** the offset of the attribute from the buffer, defaults to 0 */
    public offset: number | undefined;
    /** is this an instanced buffer? (defaults to false) */
    public instance: boolean;
    /**
     * attribute divisor for instanced rendering. Note: this is a **WebGL-only** feature, the WebGPU renderer will
     * issue a warning if one of the attributes has divisor set.
     */
    public divisor?: number;

    constructor(attr: IAttribute)
    {
        this.buffer = attr.buffer || null;
        this.format = attr.format;
        this.stride = attr.stride;
        this.offset = attr.offset;
        this.instance = attr.instance || false;
        this.location = attr.location || undefined;
        this.divisor = attr.divisor || undefined;
    }
}

export function ensureIsAttribute(attribute: AttributeOption, defaultBuffer?: Buffer, defaultInstance?: boolean): IAttribute
{
    if (typeof attribute === 'string')
    {
        return {
            buffer: defaultBuffer,
            instance: defaultInstance,
            format: attribute as VertexFormat
        };
    }

    if (isBufferOption(attribute instanceof Buffer))
    {
        return {
            buffer: ensureIsBuffer(attribute as BufferOption, false),
        };
    }

    const attr = attribute as IAttribute;

    if (attr.buffer)
    {
        attr.buffer = ensureIsBuffer(attr.buffer, false);
    }
    else
    {
        attr.buffer = defaultBuffer;
        attr.instance = defaultInstance;
    }

    return attr;
}
