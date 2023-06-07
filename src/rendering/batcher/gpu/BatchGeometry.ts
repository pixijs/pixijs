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
        });

        const indexBuffer = new Buffer({
            data: placeHolderIndexData,
            label: 'index-batch-buffer',
            usage: BufferUsage.INDEX | BufferUsage.COPY_DST, // | BufferUsage.STATIC,
        });

        const stride = vertexSize * 4;

        super({
            attributes: {
                aPosition: {
                    buffer: attributeBuffer,
                    shaderLocation: 0,
                    format: 'float32x2',
                    stride,
                    offset: 0,
                },
                aUV: {
                    buffer: attributeBuffer,
                    shaderLocation: 1,
                    format: 'float32x2',
                    stride,
                    offset: 2 * 4,
                },
                aColor: {
                    buffer: attributeBuffer,
                    shaderLocation: 2,
                    format: 'unorm8x4',
                    stride,
                    offset: 4 * 4,
                },
                aTextureId: {
                    buffer: attributeBuffer,
                    shaderLocation: 3,
                    format: 'float32',
                    stride,
                    offset: 5 * 4,
                },
            },
            indexBuffer
        });
    }

    reset()
    {
        this.indexBuffer.data = placeHolderIndexData;
        this.buffers[0].data = placeHolderBufferData;
    }
}

