import { Buffer } from '../../../../rendering/renderers/shared/buffer/Buffer';
import { BufferUsage } from '../../../../rendering/renderers/shared/buffer/const';
import { Geometry } from '../../../../rendering/renderers/shared/geometry/Geometry';

const placeHolderBufferData = new Float32Array(1);
const placeHolderIndexData = new Uint32Array(1);

/**
 * Geometry of the smooth graphics batchers: 14 floats per vertex, or 20 floats per vertex
 * when textured, with a texture coordinate matrix in `aUvU` and `aUvV`.
 * @category rendering
 * @internal
 */
export class SmoothBatchGeometry extends Geometry
{
    /**
     * @param textured - whether to include the texture coordinate matrix attributes
     */
    constructor(textured = false)
    {
        const vertexSize = textured ? 20 : 14;

        const attributeBuffer = new Buffer({
            data: placeHolderBufferData,
            label: 'attribute-smooth-batch-buffer',
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
            shrinkToFit: false,
        });

        const indexBuffer = new Buffer({
            data: placeHolderIndexData,
            label: 'index-smooth-batch-buffer',
            usage: BufferUsage.INDEX | BufferUsage.COPY_DST,
            shrinkToFit: false,
        });

        const stride = vertexSize * 4;

        super({
            attributes: {
                aPrev: {
                    buffer: attributeBuffer,
                    format: 'float32x2',
                    stride,
                    offset: 0,
                },
                aPoint1: {
                    buffer: attributeBuffer,
                    format: 'float32x2',
                    stride,
                    offset: 2 * 4,
                },
                aPoint2: {
                    buffer: attributeBuffer,
                    format: 'float32x2',
                    stride,
                    offset: 4 * 4,
                },
                aNext: {
                    buffer: attributeBuffer,
                    format: 'float32x2',
                    stride,
                    offset: 6 * 4,
                },
                aTravel: {
                    buffer: attributeBuffer,
                    format: 'float32',
                    stride,
                    offset: 8 * 4,
                },
                aVertexJoint: {
                    buffer: attributeBuffer,
                    format: 'float32',
                    stride,
                    offset: 9 * 4,
                },
                aLineWidth: {
                    buffer: attributeBuffer,
                    format: 'float32',
                    stride,
                    offset: 10 * 4,
                },
                aStylePacked: {
                    buffer: attributeBuffer,
                    format: 'float32',
                    stride,
                    offset: 11 * 4,
                },
                aColor: {
                    buffer: attributeBuffer,
                    format: 'unorm8x4',
                    stride,
                    offset: 12 * 4,
                },
                aTextureIdAndRound: {
                    buffer: attributeBuffer,
                    format: 'uint16x2',
                    stride,
                    offset: 13 * 4,
                },
                ...(textured ? {
                    aUvU: {
                        buffer: attributeBuffer,
                        format: 'float32x3',
                        stride,
                        offset: 14 * 4,
                    },
                    aUvV: {
                        buffer: attributeBuffer,
                        format: 'float32x3',
                        stride,
                        offset: 17 * 4,
                    },
                } : {}),
            },
            indexBuffer,
        });
    }
}
