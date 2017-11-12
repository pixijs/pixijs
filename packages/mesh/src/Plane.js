import Mesh from './Mesh';

/**
 * The Plane allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let Plane = new PIXI.Plane(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 *
 */
export default class Plane extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the Plane.
     * @param {number} verticesX - The number of vertices in the x-axis
     * @param {number} verticesY - The number of vertices in the y-axis
     * @param {object} opts - an options object - add meshWidth and meshHeight
     */
    constructor(texture, verticesX, verticesY, opts = {})
    {
        super(texture, new Float32Array(1), new Float32Array(1), new Uint16Array(1), 4);

        this.segmentsX = this.verticesX = verticesX || 10;
        this.segmentsY = this.verticesY = verticesY || 10;

        this.meshWidth = opts.meshWidth || texture.width;
        this.meshHeight = opts.meshHeight || texture.height;

        this.refresh();
    }

    /**
     * Refreshes
     *
     */
    refresh()
    {
        const total = this.verticesX * this.verticesY;
        const verts = [];
        const uvs = [];
        const indices = [];
        const texture = this.texture;

        const segmentsX = this.verticesX - 1;
        const segmentsY = this.verticesY - 1;

        const sizeX = this.meshWidth / segmentsX;
        const sizeY =  this.meshHeight / segmentsY;

        for (let i = 0; i < total; i++)
        {
            if (texture._uvs)
            {
                const x = (i % this.verticesX);
                const y = ((i / this.verticesX) | 0);

                verts.push((x * sizeX),
                    (y * sizeY));

                // this works for rectangular textures.
                uvs.push(
                    texture._uvs.x0 + ((texture._uvs.x1 - texture._uvs.x0) * (x / (this.verticesX - 1))),
                    texture._uvs.y0 + ((texture._uvs.y3 - texture._uvs.y0) * (y / (this.verticesY - 1)))
                );
            }
            else
            {
                uvs.push(0);
            }
        }

        const totalSub = segmentsX * segmentsY;

        for (let i = 0; i < totalSub; i++)
        {
            const xpos = i % segmentsX;
            const ypos = (i / segmentsX) | 0;

            const value = (ypos * this.verticesX) + xpos;
            const value2 = (ypos * this.verticesX) + xpos + 1;
            const value3 = ((ypos + 1) * this.verticesX) + xpos;
            const value4 = ((ypos + 1) * this.verticesX) + xpos + 1;

            indices.push(value, value2, value3);
            indices.push(value2, value4, value3);
        }

        this.shader.uniforms.alpha = 1;
        this.shader.uniforms.uSampler2 = this.texture;

        this.vertices = new Float32Array(verts);
        this.uvs = new Float32Array(uvs);
        this.indices = new Uint16Array(indices);

        this.geometry.buffers[0].data = this.vertices;
        this.geometry.buffers[1].data = this.uvs;
        this.geometry.indexBuffer.data = this.indices;

        // ensure that the changes are uploaded
        this.geometry.buffers[0].update();
        this.geometry.buffers[1].update();
        this.geometry.indexBuffer.update();
    }

    /**
     * Updates the object transform for rendering
     *
     * @private
     */
    updateTransform()
    {
        this.geometry.buffers[0].update();
        this.containerUpdateTransform();
    }
}
