import Mesh from './Mesh';
import Geometry from './geometry/Geometry';
import * as core from '../core';
import { readFileSync } from 'fs';
import { join } from 'path';

let meshShader;
const temp = new Float32Array([0, 0, 0]);

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

        super(geometry, meshShader, {}, 5);

        this.texture = texture;

        /*
         * @member {PIXI.Point[]} An array of points that determine the rope
         */
        this.points = points;

        /**
         * Tracker for if the rope is ready to be drawn. Needed because Mesh ctor can
         * call _onTextureUpdated which could call refresh too early.
         *
         * @member {boolean}
         * @private
         */
        this._ready = true;

        this.tint = 0xFFFFFF;

         // wait for the texture to load
        if (texture.baseTexture.hasLoaded)
        {
            this._onTextureUpdate();
        }
        else
        {
            texture.once('update', this._onTextureUpdate, this);
        }
    }

    /**
     * Refreshes
     */
    refresh()
    {
        const points = this.points;
        const vertices = this.geometry.getAttribute('aVertexPosition').data;
        const uvs = this.geometry.getAttribute('aTextureCoord').data;

        // TODO - lets make this more accessable... maybe a getIndx()?
        const indices = this.geometry.data.indexBuffer.data;

        // if too little points, or texture hasn't got UVs set yet just move on.
        if (points.length < 1 || !this.texture._uvs)
        {
            return;
        }

        // if the number of points has changed we will need to recreate the arraybuffers
        if (vertices.length / 4 !== points.length)
        {
            /*
            this.vertices = new Float32Array(points.length * 4);
            this.uvs = new Float32Array(points.length * 4);
            this.colors = new Float32Array(points.length * 2);
            this.indices = new Uint16Array(points.length * 2);
            */
        }

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
        this.geometry.getAttribute('aVertexPosition').update();
        this.geometry.getAttribute('aTextureCoord').update();
        this.geometry.data.indexBuffer.update();
    }

    /**
     * Clear texture UVs when new texture is set
     *
     * @private
     */
    _onTextureUpdate()
    {
        // wait for the Rope ctor to finish before calling refresh
        if (this._ready)
        {
            this.refresh();
        }
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

        const vertices =  this.geometry.getAttribute('aVertexPosition').data;

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

        this.shader.uniforms.alpha = 1;
        this.shader.uniforms.uSampler2 = this.texture;

        this.geometry.getAttribute('aVertexPosition').update();
        this.containerUpdateTransform();
    }

    _renderWebGL(renderer)
    {
        this.shader.uniforms.tint = core.utils.hex2rgb(this.tint, temp);
        this.shader.uniforms.uSampler2 = this.texture;

        renderer.setObjectRenderer(renderer.plugins.mesh);
        renderer.plugins.mesh.render(this);
    }
}
