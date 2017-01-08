import Mesh from './Mesh';
import Geometry from './geometry/Geometry';
import * as core from '../core';
import { readFileSync } from 'fs';
import { join } from 'path';

let meshShader;

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
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 *
 */
export default class Plane extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the Plane.
     * @param {number} verticesX - The number of vertices in the x-axis
     * @param {number} verticesY - The number of vertices in the y-axis
     */
    constructor(texture, verticesX, verticesY)
    {
        const geometry = new Geometry();

        if (!meshShader)
        {
            meshShader = new core.Shader(readFileSync(join(__dirname, './webgl/mesh.vert'), 'utf8'),
                                         readFileSync(join(__dirname, './webgl/mesh.frag'), 'utf8'));
        }

        geometry.addAttribute('aVertexPosition', new Float32Array(2), 2)
        .addAttribute('aTextureCoord', new Float32Array(2), 2)
        .addIndex(new Uint16Array(2));

        const uniforms = {
            uSampler2: texture,
            alpha: 1,
            translationMatrix: null,
            tint: new Float32Array([1, 1, 1]),
        };

        super(geometry, meshShader, uniforms, null, 4);

        uniforms.translationMatrix = this.transform.worldTransform;

        this.texture = texture;

        this.segmentsX = this.verticesX = verticesX || 10;
        this.segmentsY = this.verticesY = verticesY || 10;

        if (texture.baseTexture.hasLoaded)
        {
            this.refresh();
        }
        else
        {
            texture.once('update', this.refresh, this);
        }

        this._tint = 0xFFFFFF;
        this.tint = 0xFFFFFF;
    }

     /**
     * The tint applied to the Rope. This is a hex value. A value of
     * 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     * @default 0xFFFFFF
     */
    get tint()
    {
        return this._tint;
    }

    /**
     * Sets the tint of the rope.
     *
     * @param {number} value - The value to set to.
     */
    set tint(value)
    {
        this._tint = value;
        core.utils.hex2rgb(this._tint, this.uniforms.tint);
    }

    /**
     * Sets the texture of the rope.
     *
     * @param {PIXI.Texture} value - The value to set to.
     */
    set texture(value)
    {
        this._texture = value;
        this.uniforms.uSampler2 = this.texture;
    }

    /**
     * The texture that the rope is using
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.Sprite#
     */
    get texture()
    {
        return this._texture;
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

        const sizeX = texture.width / segmentsX;
        const sizeY =  texture.height / segmentsY;

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

        this.geometry.getAttribute('aVertexPosition').data = this.vertices;
        this.geometry.getAttribute('aTextureCoord').data = this.uvs;
        this.geometry.data.indexBuffer.data = this.indices;

        // ensure that the changes are uploaded
        this.geometry.getAttribute('aVertexPosition').update();
        this.geometry.getAttribute('aTextureCoord').update();
        this.geometry.data.indexBuffer.update();
    }

    /**
     * Updates the object transform for rendering
     *
     * @private
     */
    updateTransform()
    {
        this.geometry.getAttribute('aVertexPosition').update();
        this.containerUpdateTransform();
    }
}
