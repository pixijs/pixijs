import { Buffer } from '../../renderers/shared/buffer/Buffer';
import { BufferUsage } from '../../renderers/shared/buffer/const';
import { Geometry } from '../../renderers/shared/geometry/Geometry';

import type { BatchMode } from '../../graphics/shared/GraphicsContext';
import type { Topology } from '../../renderers/shared/geometry/const';

export interface MeshGeometryOptions
{
    positions?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint32Array;
    topology?: Topology;
}

export class MeshGeometry extends Geometry
{
    public static defaultOptions: MeshGeometryOptions = {
        topology: 'triangle-list',
    };

    public batchMode: BatchMode = 'auto';

    constructor(options: MeshGeometryOptions = {})
    {
        options = { ...MeshGeometry.defaultOptions, ...options };

        const positions = options.positions || new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        const uvs = options.uvs || new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        const indices = options.indices || new Uint32Array([0, 1, 2, 0, 2, 3]);

        const positionBuffer = new Buffer({
            data: positions,
            label: 'attribute-mesh-positions',
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
        });

        const uvBuffer = new Buffer({
            data: uvs,
            label: 'attribute-mesh-uvs',
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
        });

        const indexBuffer = new Buffer({
            data: indices,
            label: 'index-mesh-buffer',
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
