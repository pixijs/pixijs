import { Buffer } from '../../src/rendering/renderers/shared/buffer/Buffer';
import { Geometry } from '../../src/rendering/renderers/shared/geometry/Geometry';

export function getGeometry()
{
    return new Geometry({
        attributes: {
            aVertexPosition: {
                buffer: new Buffer({
                    data: new Float32Array([1, 2, 3]),
                    usage: 1,
                }),
                shaderLocation: 0,
                format: 'float32x2',
                stride: 2 * 4,
                offset: 0,
            }
        }
    });
}
