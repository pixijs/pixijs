import { MeshGeometry } from '@pixi/mesh';

export class PlaneGeometry extends MeshGeometry
{
    public segWidth: number;
    public segHeight: number;
    public width: number;
    public height: number;

    constructor(width = 100, height = 100, segWidth = 10, segHeight = 10)
    {
        super();

        this.segWidth = segWidth;
        this.segHeight = segHeight;

        this.width = width;
        this.height = height;

        this.build();
    }

    /**
     * Refreshes plane coordinates
     * @private
     */
    build(): void
    {
        const total = this.segWidth * this.segHeight;
        const verts = [];
        const uvs = [];
        const indices = [];

        const segmentsX = this.segWidth - 1;
        const segmentsY = this.segHeight - 1;

        const sizeX = (this.width) / segmentsX;
        const sizeY = (this.height) / segmentsY;

        for (let i = 0; i < total; i++)
        {
            const x = (i % this.segWidth);
            const y = ((i / this.segWidth) | 0);

            verts.push(x * sizeX, y * sizeY);
            uvs.push(x / segmentsX, y / segmentsY);
        }

        const totalSub = segmentsX * segmentsY;

        for (let i = 0; i < totalSub; i++)
        {
            const xpos = i % segmentsX;
            const ypos = (i / segmentsX) | 0;

            const value = (ypos * this.segWidth) + xpos;
            const value2 = (ypos * this.segWidth) + xpos + 1;
            const value3 = ((ypos + 1) * this.segWidth) + xpos;
            const value4 = ((ypos + 1) * this.segWidth) + xpos + 1;

            indices.push(value, value2, value3,
                value2, value4, value3);
        }

        this.buffers[0].data = new Float32Array(verts);
        this.buffers[1].data = new Float32Array(uvs);
        this.indexBuffer.data = new Uint16Array(indices);

        // ensure that the changes are uploaded
        this.buffers[0].update();
        this.buffers[1].update();
        this.indexBuffer.update();
    }
}
