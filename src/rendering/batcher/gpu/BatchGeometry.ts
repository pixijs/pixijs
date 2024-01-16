import { Buffer } from '../../renderers/shared/buffer/Buffer';
import { BufferUsage } from '../../renderers/shared/buffer/const';
import { Geometry } from '../../renderers/shared/geometry/Geometry';

const placeHolderBufferData = new Float32Array(1);
const placeHolderIndexData = new Uint32Array(1);

export class BatchGeometry extends Geometry
{
    constructor()
    {
        const vertexSize = 6;

        const attributeBuffer = new Buffer({
            data: placeHolderBufferData,
            label: 'attribute-batch-buffer',
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
            shrinkToFit: false,
        });

        const indexBuffer = new Buffer({
            data: placeHolderIndexData,
            label: 'index-batch-buffer',
            usage: BufferUsage.INDEX | BufferUsage.COPY_DST, // | BufferUsage.STATIC,
            shrinkToFit: false,
        });

        const stride = vertexSize * 4;

        super({
            attributes: {
                aPosition: {
                    buffer: attributeBuffer,
                    location: 0,
                    format: 'float32x2',
                    stride,
                    offset: 0,
                },
                aUV: {
                    buffer: attributeBuffer,
                    location: 1,
                    format: 'float32x2',
                    stride,
                    offset: 2 * 4,
                },
                aColor: {
                    buffer: attributeBuffer,
                    location: 2,
                    format: 'unorm8x4',
                    stride,
                    offset: 4 * 4,
                },
                aTextureIdAndRound: {
                    buffer: attributeBuffer,
                    location: 3,
                    format: 'uint16x2',
                    stride,
                    offset: 5 * 4,
                },
            },
            indexBuffer
        });
    }
}

