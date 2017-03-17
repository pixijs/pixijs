import * as core from '../../core';
import { default as Mesh } from '../Mesh';

/**
 * Renderer dedicated to meshes.
 *
 * @class
 * @private
 * @memberof PIXI
 */
export default class MeshSpriteRenderer
{
    /**
     * @param {PIXI.CanvasRenderer} renderer - The renderer this downport works for
     */
    constructor(renderer)
    {
        this.renderer = renderer;
    }

    /**
     * Renders the Mesh
     *
     * @param {PIXI.mesh.Mesh} mesh - the Mesh to render
     */
    render(mesh)
    {
        const renderer = this.renderer;
        const context = renderer.context;

        const transform = mesh.worldTransform;
        const res = renderer.resolution;

        if (renderer.roundPixels)
        {
            context.setTransform(
                transform.a * res,
                transform.b * res,
                transform.c * res,
                transform.d * res,
                (transform.tx * res) | 0,
                (transform.ty * res) | 0
            );
        }
        else
        {
            context.setTransform(
                transform.a * res,
                transform.b * res,
                transform.c * res,
                transform.d * res,
                transform.tx * res,
                transform.ty * res
            );
        }

        renderer.setBlendMode(mesh.blendMode);

        if (mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH)
        {
            this._renderTriangleMesh(mesh);
        }
        else
        {
            this._renderTriangles(mesh);
        }
    }

    /**
     * Draws the object in Triangle Mesh mode
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - the Mesh to render
     */
    _renderTriangleMesh(mesh)
    {
        // draw triangles!!
        const length = mesh.vertices.length / 2;

        for (let i = 0; i < length - 2; i++)
        {
            // draw some triangles!
            const index = i * 2;

            this._renderDrawTriangle(mesh, index, (index + 2), (index + 4));
        }
    }

    /**
     * Draws the object in triangle mode using canvas
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - the current mesh
     */
    _renderTriangles(mesh)
    {
        // draw triangles!!
        const indices = mesh.indices;
        const length = indices.length;

        for (let i = 0; i < length; i += 3)
        {
            // draw some triangles!
            const index0 = indices[i] * 2;
            const index1 = indices[i + 1] * 2;
            const index2 = indices[i + 2] * 2;

            this._renderDrawTriangle(mesh, index0, index1, index2);
        }
    }

    /**
     * Draws one of the triangles that from the Mesh
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - the current mesh
     * @param {number} index0 - the index of the first vertex
     * @param {number} index1 - the index of the second vertex
     * @param {number} index2 - the index of the third vertex
     */
    _renderDrawTriangle(mesh, index0, index1, index2)
    {
        const context = this.renderer.context;
        const uvs = mesh.uvs;
        const vertices = mesh.vertices;
        const texture = mesh._texture;

        if (!texture.valid)
        {
            return;
        }

        const base = texture.baseTexture;
        const textureSource = base.source;
        const textureWidth = base.width;
        const textureHeight = base.height;

        let u0;
        let u1;
        let u2;
        let v0;
        let v1;
        let v2;

        if (mesh.uploadUvTransform)
        {
            const ut = mesh._uvTransform.mapCoord;

            u0 = ((uvs[index0] * ut.a) + (uvs[index0 + 1] * ut.c) + ut.tx) * base.width;
            u1 = ((uvs[index1] * ut.a) + (uvs[index1 + 1] * ut.c) + ut.tx) * base.width;
            u2 = ((uvs[index2] * ut.a) + (uvs[index2 + 1] * ut.c) + ut.tx) * base.width;
            v0 = ((uvs[index0] * ut.b) + (uvs[index0 + 1] * ut.d) + ut.ty) * base.height;
            v1 = ((uvs[index1] * ut.b) + (uvs[index1 + 1] * ut.d) + ut.ty) * base.height;
            v2 = ((uvs[index2] * ut.b) + (uvs[index2 + 1] * ut.d) + ut.ty) * base.height;
        }
        else
        {
            u0 = uvs[index0] * base.width;
            u1 = uvs[index1] * base.width;
            u2 = uvs[index2] * base.width;
            v0 = uvs[index0 + 1] * base.height;
            v1 = uvs[index1 + 1] * base.height;
            v2 = uvs[index2 + 1] * base.height;
        }

        let x0 = vertices[index0];
        let x1 = vertices[index1];
        let x2 = vertices[index2];
        let y0 = vertices[index0 + 1];
        let y1 = vertices[index1 + 1];
        let y2 = vertices[index2 + 1];

        if (mesh.canvasPadding > 0)
        {
            const paddingX = mesh.canvasPadding / mesh.worldTransform.a;
            const paddingY = mesh.canvasPadding / mesh.worldTransform.d;
            const centerX = (x0 + x1 + x2) / 3;
            const centerY = (y0 + y1 + y2) / 3;

            let normX = x0 - centerX;
            let normY = y0 - centerY;

            let dist = Math.sqrt((normX * normX) + (normY * normY));

            x0 = centerX + ((normX / dist) * (dist + paddingX));
            y0 = centerY + ((normY / dist) * (dist + paddingY));

            //

            normX = x1 - centerX;
            normY = y1 - centerY;

            dist = Math.sqrt((normX * normX) + (normY * normY));
            x1 = centerX + ((normX / dist) * (dist + paddingX));
            y1 = centerY + ((normY / dist) * (dist + paddingY));

            normX = x2 - centerX;
            normY = y2 - centerY;

            dist = Math.sqrt((normX * normX) + (normY * normY));
            x2 = centerX + ((normX / dist) * (dist + paddingX));
            y2 = centerY + ((normY / dist) * (dist + paddingY));
        }

        context.save();
        context.beginPath();

        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);

        context.closePath();

        context.clip();

        // Compute matrix transform
        const delta = (u0 * v1) + (v0 * u2) + (u1 * v2) - (v1 * u2) - (v0 * u1) - (u0 * v2);
        const deltaA = (x0 * v1) + (v0 * x2) + (x1 * v2) - (v1 * x2) - (v0 * x1) - (x0 * v2);
        const deltaB = (u0 * x1) + (x0 * u2) + (u1 * x2) - (x1 * u2) - (x0 * u1) - (u0 * x2);
        const deltaC = (u0 * v1 * x2) + (v0 * x1 * u2) + (x0 * u1 * v2) - (x0 * v1 * u2) - (v0 * u1 * x2) - (u0 * x1 * v2);
        const deltaD = (y0 * v1) + (v0 * y2) + (y1 * v2) - (v1 * y2) - (v0 * y1) - (y0 * v2);
        const deltaE = (u0 * y1) + (y0 * u2) + (u1 * y2) - (y1 * u2) - (y0 * u1) - (u0 * y2);
        const deltaF = (u0 * v1 * y2) + (v0 * y1 * u2) + (y0 * u1 * v2) - (y0 * v1 * u2) - (v0 * u1 * y2) - (u0 * y1 * v2);

        context.transform(
            deltaA / delta,
            deltaD / delta,
            deltaB / delta,
            deltaE / delta,
            deltaC / delta,
            deltaF / delta
        );

        context.drawImage(
            textureSource,
            0,
            0,
            textureWidth * base.resolution,
            textureHeight * base.resolution,
            0,
            0,
            textureWidth,
            textureHeight
        );

        context.restore();
    }

    /**
     * Renders a flat Mesh
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - The Mesh to render
     */
    renderMeshFlat(mesh)
    {
        const context = this.renderer.context;
        const vertices = mesh.vertices;
        const length = vertices.length / 2;

        // this.count++;

        context.beginPath();

        for (let i = 1; i < length - 2; ++i)
        {
            // draw some triangles!
            const index = i * 2;

            const x0 = vertices[index];
            const y0 = vertices[index + 1];

            const x1 = vertices[index + 2];
            const y1 = vertices[index + 3];

            const x2 = vertices[index + 4];
            const y2 = vertices[index + 5];

            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.lineTo(x2, y2);
        }

        context.fillStyle = '#FF0000';
        context.fill();
        context.closePath();
    }

    /**
     * destroy the the renderer.
     *
     */
    destroy()
    {
        this.renderer = null;
    }
}

core.CanvasRenderer.registerPlugin('mesh', MeshSpriteRenderer);
