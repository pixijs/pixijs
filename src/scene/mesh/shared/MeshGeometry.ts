import { Buffer } from '../../../rendering/renderers/shared/buffer/Buffer';
import { BufferUsage } from '../../../rendering/renderers/shared/buffer/const';
import { Geometry } from '../../../rendering/renderers/shared/geometry/Geometry';
import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';

import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { BatchMode } from '../../graphics/shared/GraphicsContext';

export interface MeshGeometryOptions
{
    positions?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint32Array;
    topology?: Topology;
    shrinkBuffersToFit?: boolean;
}

export class MeshGeometry extends Geometry
{
    public static defaultOptions: MeshGeometryOptions = {
        topology: 'triangle-list',
        shrinkBuffersToFit: false,
    };

    public batchMode: BatchMode = 'auto';

    constructor(options: MeshGeometryOptions);
    /** @deprecated since 8.0.0 */
    constructor(positions: Float32Array, uvs: Float32Array, indices: Uint32Array);
    constructor(...args: [MeshGeometryOptions] | [Float32Array, Float32Array, Uint32Array])
    {
        let options = args[0] ?? {};

        if (options instanceof Float32Array)
        {
            deprecation(v8_0_0, 'use new MeshGeometry({ positions, uvs, indices }) instead');

            options = {
                positions: options,
                uvs: args[1],
                indices: args[2],
            };
        }

        options = { ...MeshGeometry.defaultOptions, ...options };

        const positions = options.positions || new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        const uvs = options.uvs || new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        const indices = options.indices || new Uint32Array([0, 1, 2, 0, 2, 3]);

        const shrinkToFit = options.shrinkBuffersToFit;

        const positionBuffer = new Buffer({
            data: positions,
            label: 'attribute-mesh-positions',
            shrinkToFit,
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
        });

        const uvBuffer = new Buffer({
            data: uvs,
            label: 'attribute-mesh-uvs',
            shrinkToFit,
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
        });

        const indexBuffer = new Buffer({
            data: indices,
            label: 'index-mesh-buffer',
            shrinkToFit,
            usage: BufferUsage.INDEX | BufferUsage.COPY_DST,
        });

        super({
            attributes: {
                aPosition: {
                    buffer: positionBuffer,
                    shaderLocation: 0,
                    format: 'float32x2',
                    stride: 2 * 4,
                    offset: 0,
                },
                aUV: {
                    buffer: uvBuffer,
                    shaderLocation: 1,
                    format: 'float32x2',
                    stride: 2 * 4,
                    offset: 0,
                },
            },
            indexBuffer,
            topology: options.topology,
        });
    }

    get positions(): Float32Array
    {
        return this.attributes.aPosition.buffer.data as Float32Array;
    }

    set positions(value: Float32Array)
    {
        this.attributes.aPosition.buffer.data = value;
    }

    get uvs(): Float32Array
    {
        return this.attributes.aUV.buffer.data as Float32Array;
    }

    set uvs(value: Float32Array)
    {
        this.attributes.aUV.buffer.data = value;
    }

    get indices(): Uint32Array
    {
        return this.indexBuffer.data as Uint32Array;
    }

    set indices(value: Uint32Array)
    {
        this.indexBuffer.data = value;
    }
}
