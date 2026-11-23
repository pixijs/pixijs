/**
 * Builds KTX1 and DDS files whose pixels are known exactly.
 *
 * A texture is a grid of cells, each one compression block (4x4 texels for uncompressed formats). Every cell is a
 * single palette color, encoded with a block mode that decodes to that color without interpolation: BC1-BC3 endpoint
 * colors, BC4/BC5 endpoint values, BC6H mode 11, BC7 mode 5, ASTC void-extent blocks, ETC2 individual and
 * differential blocks, and raw texels. The cell at (x, y) of mip level `level` takes palette entry
 * `(x + (y * 3) + (level * 5)) % 8`, so neighboring cells and levels differ.
 */

type RGBA8 = readonly [number, number, number, number];
type Encode = (bytes: Uint8Array, offset: number, entry: number) => void;

interface FormatInfo
{
    /** cell footprint in texels: the block size, or 4x4 for uncompressed formats */
    cellWidth: number;
    cellHeight: number;
    /** bytes per block, or per texel for uncompressed formats */
    bytes: number;
    compressed: boolean;
    encode: Encode;
    /** KTX1 glInternalFormat */
    ktx?: number;
    /** DDS DXGI_FORMAT, written with a DX10 header */
    dxgi?: number;
    /** DDS pixel format written without a DX10 header: a FourCC or D3DFMT code, or RGB bit masks */
    legacy?: { fourCC: number } | { bitCount: number, masks: number[] };
}

// opaque colors whose channels are 0 or 255, a mid gray that sRGB formats darken, and a translucent gray
const colors: RGBA8[] = [
    [255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255], [255, 255, 0, 255],
    [255, 0, 255, 255], [0, 255, 255, 255], [128, 128, 128, 255], [255, 255, 255, 136],
];
const opaque = colors.map(([r, g, b]) => [r, g, b, 255] as RGBA8);
const reds = [255, 0, 128, 64, 191, 32, 224, 96];
const redGreens = [[255, 0], [0, 255], [255, 255], [0, 0], [128, 255], [255, 128], [64, 191], [191, 64]];
// signed values; negative ones draw as 0
const snorms = [127, 0, -128, 32, 96, 100, 50, -64];

const fourCC = (code: string): number =>
    code.charCodeAt(0) | (code.charCodeAt(1) << 8) | (code.charCodeAt(2) << 16) | (code.charCodeAt(3) << 24);

function writeBits(bytes: Uint8Array, offset: number, bit: number, count: number, value: number): void
{
    for (let i = 0; i < count; i++)
    {
        if ((value >> i) & 1) bytes[offset + ((bit + i) >> 3)] |= 1 << ((bit + i) & 7);
    }
}

const to565 = ([r, g, b]: RGBA8): number =>
    (Math.round(r * 31 / 255) << 11) | (Math.round(g * 63 / 255) << 5) | Math.round(b * 31 / 255);

// color0 is the color and every index is 0; a 565 color of 0 makes color0 <= color1, whose index 0 is still color0
function bc1Color(bytes: Uint8Array, offset: number, color: RGBA8): void
{
    const c565 = to565(color);

    bytes[offset] = c565 & 0xff;
    bytes[offset + 1] = c565 >> 8;
}

const bc1: Encode = (bytes, offset, entry) =>
{
    // the translucent entry becomes BC1's transparent black: color0 < color1 and index 3 everywhere
    if (entry === 7) bytes.set([0, 0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], offset);
    else bc1Color(bytes, offset, colors[entry]);
};
const bc2: Encode = (bytes, offset, entry) =>
{
    const alpha = Math.round(colors[entry][3] * 15 / 255);

    bytes.fill(alpha | (alpha << 4), offset, offset + 8);
    bc1Color(bytes, offset + 8, colors[entry]);
};
const bc3: Encode = (bytes, offset, entry) =>
{
    bytes[offset] = colors[entry][3];
    bc1Color(bytes, offset + 8, colors[entry]);
};
const bc4 = (values: number[]): Encode => (bytes, offset, entry) =>
{
    bytes[offset] = values[entry] & 0xff;
};
const bc5 = (signed: boolean): Encode => (bytes, offset, entry) =>
{
    bytes[offset] = signed ? snorms[entry] & 0xff : redGreens[entry][0];
    bytes[offset + 8] = signed ? snorms[(entry + 3) % 8] & 0xff : redGreens[entry][1];
};

// BC6H's decoding of a 10-bit endpoint to half-float bits
function bc6hHalf(e: number, signed: boolean): number
{
    if (e === 0) return 0;
    if (signed) return ((e >= 511 ? 0x7fff : ((e << 15) + 0x4000) >> 9) * 31) >> 5;

    return ((e === 1023 ? 0xffff : ((e << 16) + 0x8000) >> 10) * 31) >> 6;
}

// the BC6H mode 11 endpoint whose decoded half float is nearest `value`
function bc6hEndpoint(value: number, signed: boolean): number
{
    let best = 0;
    let bestError = Infinity;

    for (let e = 0; e < (signed ? 511 : 1024); e++)
    {
        const error = Math.abs(halfToFloat(bc6hHalf(e, signed)) - value);

        if (error < bestError)
        {
            best = e;
            bestError = error;
        }
    }

    return best;
}

function halfToFloat(half: number): number
{
    const exponent = (half >> 10) & 0x1f;
    const mantissa = half & 0x3ff;

    return exponent === 0 ? mantissa / 1024 / 16384 : (1 + (mantissa / 1024)) * (2 ** (exponent - 15));
}

const bc6h = (signed: boolean): Encode => (bytes, offset, entry) =>
{
    // mode 11: 5 mode bits, then 10-bit endpoints; every index is 0, so the block is the first endpoint
    writeBits(bytes, offset, 0, 5, 0b00011);
    opaque[entry].slice(0, 3).forEach((c, i) => writeBits(bytes, offset, 5 + (i * 10), 10, bc6hEndpoint(c / 255, signed)));
};
const bc7: Encode = (bytes, offset, entry) =>
{
    // mode 5: 7-bit color and 8-bit alpha endpoints; every index is 0, so the block is the first endpoint
    const color = colors[entry];

    writeBits(bytes, offset, 0, 6, 0b100000);
    color.slice(0, 3).forEach((c, i) => writeBits(bytes, offset, 8 + (i * 14), 7, Math.round(c * 127 / 255)));
    writeBits(bytes, offset, 50, 8, color[3]);
};
const astc = (bytes: Uint8Array, offset: number, entry: number): void =>
{
    // LDR void-extent block: a solid 16-bit color
    bytes.set([0xfc, 0xfd, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], offset);
    colors[entry].forEach((c, i) =>
    {
        bytes[offset + 8 + (i * 2)] = c;
        bytes[offset + 9 + (i * 2)] = c;
    });
};

// ETC1 individual mode: 4-bit base colors, codeword 0, every pixel index 0, which adds 2 to every channel
function etcIndividual(bytes: Uint8Array, offset: number, color: RGBA8): void
{
    const [r, g, b] = color.map((c) => Math.round(c / 17));

    bytes.set([(r << 4) | r, (g << 4) | g, (b << 4) | b], offset);
}

// ETC2 punch-through differential mode with the opaque bit clear: 5-bit base colors with no delta, pixel index 0
// adds nothing and pixel index 2 is transparent black
function etcPunchThrough(bytes: Uint8Array, offset: number, entry: number): void
{
    const [r, g, b] = opaque[entry].map((c) => Math.round(c * 31 / 255) << 3);

    bytes.set([r, g, b], offset);
    // pixel index 2 has its high bit set and low bit clear, for all 16 pixels
    if (entry === 7) bytes.set([0xff, 0xff], offset + 4);
}

// EAC: base codeword, multiplier 0, table 0, every index 0
const eacAlpha = (bytes: Uint8Array, offset: number, value: number): void =>
{
    bytes[offset] = value;
};

const unorm8 = (order: number[]): Encode => (bytes, offset, entry) =>
    order.forEach((c, i) =>
    {
        bytes[offset + i] = colors[entry][c];
    });
const floatTexel = (write: (view: DataView, offset: number, value: number) => void, size: number) =>
    (channels: number): Encode => (bytes, offset, entry) =>
    {
        const view = new DataView(bytes.buffer, bytes.byteOffset);
        const values = [[], [reds[entry]], redGreens[entry], [], colors[entry]][channels];

        values.forEach((v, i) => write(view, offset + (i * size), v / 255));
    };

function toHalf(value: number): number
{
    if (value === 0) return 0;

    const exponent = Math.floor(Math.log2(value));
    const mantissa = Math.round(((value / (2 ** exponent)) - 1) * 1024);

    return mantissa === 1024 ? (exponent + 16) << 10 : ((exponent + 15) << 10) | mantissa;
}

const float16 = floatTexel((view, offset, v) => view.setUint16(offset, toHalf(v), true), 2);
const float32 = floatTexel((view, offset, v) => view.setFloat32(offset, v, true), 4);
const unorm10: Encode = (bytes, offset, entry) =>
{
    const [r, g, b, a] = colors[entry];
    const ten = (c: number) => Math.round(c * 1023 / 255);

    new DataView(bytes.buffer, bytes.byteOffset).setUint32(
        offset, (ten(r) | (ten(g) << 10) | (ten(b) << 20) | (Math.round(a * 3 / 255) << 30)) >>> 0, true);
};

const block4 = (bytes: number, encode: Encode, codes: Partial<FormatInfo>): FormatInfo =>
    ({ cellWidth: 4, cellHeight: 4, bytes, compressed: true, encode, ...codes });
const texel = (bytes: number, encode: Encode, codes: Partial<FormatInfo>): FormatInfo =>
    ({ cellWidth: 4, cellHeight: 4, bytes, compressed: false, encode, ...codes });

/** Every format the generators write, keyed by PixiJS texture format */
export const textureFormats: Record<string, FormatInfo> = {
    'bc1-rgba-unorm': block4(8, bc1, { ktx: 0x83f1, dxgi: 71, legacy: { fourCC: fourCC('DXT1') } }),
    'bc1-rgba-unorm-srgb': block4(8, bc1, { ktx: 0x8c4d, dxgi: 72 }),
    'bc2-rgba-unorm': block4(16, bc2, { ktx: 0x83f2, dxgi: 74, legacy: { fourCC: fourCC('DXT3') } }),
    'bc2-rgba-unorm-srgb': block4(16, bc2, { ktx: 0x8c4e, dxgi: 75 }),
    'bc3-rgba-unorm': block4(16, bc3, { ktx: 0x83f3, dxgi: 77, legacy: { fourCC: fourCC('DXT5') } }),
    'bc3-rgba-unorm-srgb': block4(16, bc3, { ktx: 0x8c4f, dxgi: 78 }),
    'bc4-r-unorm': block4(8, bc4(reds), { ktx: 0x8dbb, dxgi: 80, legacy: { fourCC: fourCC('ATI1') } }),
    'bc4-r-snorm': block4(8, bc4(snorms), { ktx: 0x8dbc, dxgi: 81, legacy: { fourCC: fourCC('BC4S') } }),
    'bc5-rg-unorm': block4(16, bc5(false), { ktx: 0x8dbd, dxgi: 83, legacy: { fourCC: fourCC('ATI2') } }),
    'bc5-rg-snorm': block4(16, bc5(true), { ktx: 0x8dbe, dxgi: 84, legacy: { fourCC: fourCC('BC5S') } }),
    'bc6h-rgb-ufloat': block4(16, bc6h(false), { ktx: 0x8e8f, dxgi: 95 }),
    'bc6h-rgb-float': block4(16, bc6h(true), { ktx: 0x8e8e, dxgi: 96 }),
    'bc7-rgba-unorm': block4(16, bc7, { ktx: 0x8e8c, dxgi: 98 }),
    'bc7-rgba-unorm-srgb': block4(16, bc7, { ktx: 0x8e8d, dxgi: 99 }),

    'etc2-rgb8unorm': block4(8, (b, o, e) => etcIndividual(b, o, opaque[e]), { ktx: 0x9274 }),
    'etc2-rgb8unorm-srgb': block4(8, (b, o, e) => etcIndividual(b, o, opaque[e]), { ktx: 0x9275 }),
    'etc2-rgb8a1unorm': block4(8, etcPunchThrough, { ktx: 0x9276 }),
    'etc2-rgb8a1unorm-srgb': block4(8, etcPunchThrough, { ktx: 0x9277 }),
    'etc2-rgba8unorm': block4(16, (b, o, e) =>
    {
        eacAlpha(b, o, colors[e][3]);
        etcIndividual(b, o + 8, colors[e]);
    }, { ktx: 0x9278 }),
    'etc2-rgba8unorm-srgb': block4(16, (b, o, e) =>
    {
        eacAlpha(b, o, colors[e][3]);
        etcIndividual(b, o + 8, colors[e]);
    }, { ktx: 0x9279 }),
    'eac-r11unorm': block4(8, (b, o, e) => eacAlpha(b, o, reds[e]), { ktx: 0x9270 }),

    rgba8unorm: texel(4, unorm8([0, 1, 2, 3]), {
        ktx: 0x1908, dxgi: 28, legacy: { bitCount: 32, masks: [0xff, 0xff00, 0xff0000, 0xff000000] },
    }),
    'rgba8unorm-srgb': texel(4, unorm8([0, 1, 2, 3]), { ktx: 0x8c43, dxgi: 29 }),
    bgra8unorm: texel(4, unorm8([2, 1, 0, 3]), {
        dxgi: 87, legacy: { bitCount: 32, masks: [0xff0000, 0xff00, 0xff, 0xff000000] },
    }),
    'bgra8unorm-srgb': texel(4, unorm8([2, 1, 0, 3]), { dxgi: 91 }),
    // legacy headers PixiJS reads: L8 and A8L8 masks with RGB flags, and D3DX's swapped A2B10G10R10 masks, which
    // hold R10G10B10A2 data
    r8unorm: texel(1, (b, o, e) =>
    {
        b[o] = reds[e];
    }, { dxgi: 61, legacy: { bitCount: 8, masks: [0xff, 0, 0, 0] } }),
    rg8unorm: texel(2, (b, o, e) => b.set(redGreens[e], o), {
        dxgi: 49, legacy: { bitCount: 16, masks: [0xff, 0, 0, 0xff00] },
    }),
    rgb10a2unorm: texel(4, unorm10, {
        dxgi: 24, legacy: { bitCount: 32, masks: [0x3ff00000, 0xffc00, 0x3ff, 0xc0000000] },
    }),
    r16float: texel(2, float16(1), { dxgi: 54, legacy: { fourCC: 111 } }),
    rg16float: texel(4, float16(2), { dxgi: 34, legacy: { fourCC: 112 } }),
    rgba16float: texel(8, float16(4), { dxgi: 10, legacy: { fourCC: 113 } }),
    r32float: texel(4, float32(1), { dxgi: 41, legacy: { bitCount: 32, masks: [0xffffffff, 0, 0, 0] } }),
    rg32float: texel(8, float32(2), { dxgi: 16, legacy: { fourCC: 115 } }),
    rgba32float: texel(16, float32(4), { dxgi: 2, legacy: { fourCC: 116 } }),
};

/** ASTC block footprints, in the order of their GL internal formats */
export const astcFootprints = [
    '4x4', '5x4', '5x5', '6x5', '6x6', '8x5', '8x6', '8x8', '10x5', '10x6', '10x8', '10x10', '12x10', '12x12',
];

astcFootprints.forEach((footprint, i) =>
{
    const [cellWidth, cellHeight] = footprint.split('x').map(Number);
    const info = { cellWidth, cellHeight, bytes: 16, compressed: true, encode: astc };

    textureFormats[`astc-${footprint}-unorm`] = { ...info, ktx: 0x93b0 + i };
    textureFormats[`astc-${footprint}-unorm-srgb`] = { ...info, ktx: 0x93d0 + i };
});

/** The file a scene loads: a texture format at a size, in a container */
export interface TextureFile
{
    /** a key of {@link textureFormats} */
    format: string;
    /** image width in pixels */
    width: number;
    /** image height in pixels */
    height: number;
    /** number of mip levels, the full chain by default */
    levels?: number;
    /** `ktx` (the default when the format has a KTX code), `dds` with a DX10 header, or `dds-legacy` without one */
    container?: 'ktx' | 'dds' | 'dds-legacy';
}

/**
 * Returns the number of levels in a full mip chain
 * @param width - the image width
 * @param height - the image height
 */
export function fullChain(width: number, height: number): number
{
    return Math.floor(Math.log2(Math.max(width, height))) + 1;
}

/**
 * Builds the mip levels of a file, one cell color per block (or per 4x4 texels)
 * @param file - the format, size and level count
 */
function createLevels(file: TextureFile): Uint8Array[]
{
    const info = textureFormats[file.format];
    const levels: Uint8Array[] = [];

    for (let level = 0; level < (file.levels ?? fullChain(file.width, file.height)); level++)
    {
        const width = Math.max(file.width >> level, 1);
        const height = Math.max(file.height >> level, 1);
        const columns = info.compressed ? Math.ceil(width / info.cellWidth) : width;
        const rows = info.compressed ? Math.ceil(height / info.cellHeight) : height;
        const bytes = new Uint8Array(columns * rows * info.bytes);

        for (let y = 0; y < rows; y++)
        {
            for (let x = 0; x < columns; x++)
            {
                const cellX = info.compressed ? x : Math.floor(x / info.cellWidth);
                const cellY = info.compressed ? y : Math.floor(y / info.cellHeight);

                info.encode(bytes, ((y * columns) + x) * info.bytes, (cellX + (cellY * 3) + (level * 5)) % 8);
            }
        }

        levels.push(bytes);
    }

    return levels;
}

function createKTX(glInternalFormat: number, compressed: boolean, width: number, height: number, levels: Uint8Array[])
{
    const padded = (length: number) => Math.ceil(length / 4) * 4;
    const buffer = new ArrayBuffer(64 + levels.reduce((sum, level) => sum + 4 + padded(level.length), 0));
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    bytes.set([0xab, 0x4b, 0x54, 0x58, 0x20, 0x31, 0x31, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a]);
    view.setUint32(12, 0x04030201, true);
    view.setUint32(16, compressed ? 0 : 0x1401, true); // glType: UNSIGNED_BYTE for uncompressed data
    view.setUint32(20, 1, true); // glTypeSize
    view.setUint32(24, compressed ? 0 : 0x1908, true); // glFormat: RGBA for uncompressed data
    view.setUint32(28, glInternalFormat, true);
    view.setUint32(32, 0x1908, true); // glBaseInternalFormat
    view.setUint32(36, width, true);
    view.setUint32(40, height, true);
    view.setUint32(52, 1, true); // numberOfFaces
    view.setUint32(56, levels.length, true);

    let offset = 64;

    for (const level of levels)
    {
        view.setUint32(offset, level.length, true);
        bytes.set(level, offset + 4);
        offset += 4 + padded(level.length);
    }

    return buffer;
}

function createDDS(info: FormatInfo, legacy: boolean, width: number, height: number, levels: Uint8Array[])
{
    const headerSize = legacy ? 128 : 148;
    const buffer = new ArrayBuffer(headerSize + levels.reduce((sum, level) => sum + level.length, 0));
    const header = new Uint32Array(buffer, 0, headerSize / 4);

    header[0] = fourCC('DDS ');
    header[1] = 124;
    // CAPS, HEIGHT, WIDTH, PIXELFORMAT, MIPMAPCOUNT, and LINEARSIZE or PITCH
    header[2] = 0x1 | 0x2 | 0x4 | 0x1000 | 0x20000 | (info.compressed ? 0x80000 : 0x8);
    header[3] = height;
    header[4] = width;
    header[5] = info.compressed ? levels[0].length : width * info.bytes;
    header[7] = levels.length;
    header[19] = 32;
    // TEXTURE, plus MIPMAP and COMPLEX when there are mip levels
    header[27] = 0x1000 | (levels.length > 1 ? 0x400008 : 0);

    if (!legacy)
    {
        header[20] = 0x4; // FOURCC
        header[21] = fourCC('DX10');
        header.set([info.dxgi, 3, 0, 1, 0], 32); // 2D texture, one array layer
    }
    else if ('fourCC' in info.legacy)
    {
        header[20] = 0x4;
        header[21] = info.legacy.fourCC;
    }
    else
    {
        header[20] = info.legacy.masks[3] ? 0x41 : 0x40; // RGB, plus ALPHAPIXELS
        header[22] = info.legacy.bitCount;
        header.set(info.legacy.masks, 23);
    }

    let offset = headerSize;

    for (const level of levels)
    {
        new Uint8Array(buffer, offset, level.length).set(level);
        offset += level.length;
    }

    return buffer;
}

/**
 * Builds a KTX1 or DDS file
 * @param file - the format, size, level count and container
 */
export function createTextureFile(file: TextureFile): ArrayBuffer
{
    const info = textureFormats[file.format];
    const container = file.container ?? (info.ktx ? 'ktx' : 'dds');
    const levels = createLevels(file);

    return container === 'ktx'
        ? createKTX(info.ktx, info.compressed, file.width, file.height, levels)
        : createDDS(info, container === 'dds-legacy', file.width, file.height, levels);
}
