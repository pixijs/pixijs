import { Buffer } from '../../renderers/shared/buffer/Buffer';
import { BufferUsage } from '../../renderers/shared/buffer/const';
import { Geometry } from '../../renderers/shared/geometry/Geometry';

const placeHolderBufferData = new Float32Array(1);
const placeHolderIndexData = new Uint32Array(1);

export class Batch2DArrayGeometry extends Geometry
{
    constructor()
    {
        const vertexSize = 7;

        const attributeBuffer = new Buffer({
            data: placeHolderBufferData,
            label: 'attribute-batch-2d-array-buffer',
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
            shrinkToFit: false,
        });

        const indexBuffer = new Buffer({
            data: placeHolderIndexData,
            label: 'index-batch-2d-array-buffer',
            usage: BufferUsage.INDEX | BufferUsage.COPY_DST, // | BufferUsage.STATIC,
            shrinkToFit: false,
        });

        const stride = vertexSize * 4;

        super({
            attributes: {
                aPosition: {
                    buffer: attributeBuffer,
                    format: 'float32x2',
                    stride,
                    offset: 0,
                },
                aUV: {
                    buffer: attributeBuffer,
                    format: 'float32x2',
                    stride,
                    offset: 2 * 4,
                },
                aColor: {
                    buffer: attributeBuffer,
                    format: 'unorm8x4',
                    stride,
                    offset: 4 * 4,
                },
                aTextureIdAndRound: {
                    buffer: attributeBuffer,
                    format: 'uint16x2',
                    stride,
                    offset: 5 * 4,
                },
                aLayerId: {
                    buffer: attributeBuffer,
                    format: 'float32',
                    stride,
                    offset: 6 * 4,
                },
            },
            indexBuffer
        });
    }
}

