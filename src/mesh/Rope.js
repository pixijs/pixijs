import Mesh from './Mesh';
import Geometry from './geometry/Geometry';
import * as core from '../core';
import { readFileSync } from 'fs';
import { join } from 'path';

let meshShader;

/**
 * The rope allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let rope = new PIXI.Rope(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 *
 */
export default class Rope extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the rope.
     * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
     */
    constructor(texture, points)
    {
        if (!meshShader)
        {
            meshShader = new core.Shader(readFileSync(join(__dirname, './webgl/mesh.vert'), 'utf8'),
                                         readFileSync(join(__dirname, './webgl/mesh.frag'), 'utf8'));
        }

        const geometry = new Geometry();

        geometry.addAttribute('aVertexPosition', new Float32Array(points.length * 4), 2)
        .addAttribute('aTextureCoord', new Float32Array(points.length * 4), 2)
        .addIndex(new Uint16Array(points.length * 2));

        const uniforms = {
            uSampler2: texture,
            alpha: 1,
            translationMatrix: null,
            tint: new Float32Array([1, 1, 1]),
        };

        super(geometry, meshShader, uniforms, null, 5);

        uniforms.translationMatrix = this.transform.worldTransform;

        /*
         * @member {PIXI.Point[]} An array of points that determine the rope
         */
        this.points = points;

        /**
         * The tint applied to the rope. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
         *
         * @private
         * @member {number}
         * @default 0xFFFFFF
         */
        this._tint = 0xFFFFFF;
        this.tint = 0xFFFFFF;

        this.texture = texture;
         // wait for the texture to load
        if (texture.baseTexture.hasLoaded)
        {
            this.refresh();
        }
        else
        {
            texture.once('update', this.refresh, this);
        }
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
     */
    refresh()
    {
        const points = this.points;

        const vertexBuffer = this.geometry.getAttribute('aVertexPosition');
        const uvBuffer = this.geometry.getAttribute('aTextureCoord');
        const indexBuffer = this.geometry.getIndex();

        // if too little points, or texture hasn't got UVs set yet just move on.
        if (points.length < 1 || !this.texture._uvs)
        {
            return;
        }

        // if the number of points has changed we will need to recreate the arraybuffers
        if (vertexBuffer.data.length / 4 !== points.length)
        {
            vertexBuffer.data = new Float32Array(points.length * 4);
            uvBuffer.data = new Float32Array(points.length * 4);
            indexBuffer.data = new Uint16Array(points.length * 2);
        }

        const uvs = uvBuffer.data;
        const indices = indexBuffer.data;

        const textureUvs = this.texture._uvs;
        const offset = new core.Point(textureUvs.x0, textureUvs.y0);
        const factor = new core.Point(textureUvs.x2 - textureUvs.x0, textureUvs.y2 - textureUvs.y0);

        uvs[0] = 0 + offset.x;
        uvs[1] = 0 + offset.y;
        uvs[2] = 0 + offset.x;
        uvs[3] = Number(factor.y) + offset.y;

        indices[0] = 0;
        indices[1] = 1;

        const total = points.length;

        for (let i = 1; i < total; i++)
        {
            // time to do some smart drawing!
            let index = i * 4;
            const amount = i / (total - 1);

            uvs[index] = (amount * factor.x) + offset.x;
            uvs[index + 1] = 0 + offset.y;

            uvs[index + 2] = (amount * factor.x) + offset.x;
            uvs[index + 3] = Number(factor.y) + offset.y;

            index = i * 2;
            indices[index] = index;
            indices[index + 1] = index + 1;
        }

        // ensure that the changes are uploaded
        vertexBuffer.update();
        uvBuffer.update();
        indexBuffer.update();
    }

    /**
     * Updates the object transform for rendering
     *
     * @private
     */
    updateTransform()
    {
        const points = this.points;

        if (points.length < 1)
        {
            return;
        }

        let lastPoint = points[0];
        let nextPoint;
        let perpX = 0;
        let perpY = 0;

        // this.count -= 0.2;

        const vertexBuffer = this.geometry.getAttribute('aVertexPosition');
        const vertices = vertexBuffer.data;

        const total = points.length;

        for (let i = 0; i < total; i++)
        {
            const point = points[i];
            const index = i * 4;

            if (i < points.length - 1)
            {
                nextPoint = points[i + 1];
            }
            else
            {
                nextPoint = point;
            }

            perpY = -(nextPoint.x - lastPoint.x);
            perpX = nextPoint.y - lastPoint.y;

            let ratio = (1 - (i / (total - 1))) * 10;

            if (ratio > 1)
            {
                ratio = 1;
            }
            const perpLength = Math.sqrt((perpX * perpX) + (perpY * perpY));
            const num = this.texture.height / 2; // (20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;

            perpX /= perpLength;
            perpY /= perpLength;

            perpX *= num;
            perpY *= num;

            vertices[index] = point.x + perpX;
            vertices[index + 1] = point.y + perpY;
            vertices[index + 2] = point.x - perpX;
            vertices[index + 3] = point.y - perpY;

            lastPoint = point;
        }

        // mark the buffer as requiring an upload..
        vertexBuffer.update();

        this.uniforms.alpha = this.worldAlpha;

        this.containerUpdateTransform();
    }
}
