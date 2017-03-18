import * as core from '../core';
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
        super(texture);

        this._verticesX = verticesX || 2;
        this._verticesY = verticesY || 2;

        this._lastWidth = texture.orig.width;
        this._lastHeight = texture.orig.height;

        /**
         *  Version counter for verticesX/verticesY change
         *
         * @member {number}
         * @private
         */
        this._dimensionsID = 0;

        this._lastDimensionsID = -1;

        /**
         *  Version counter for vertices updates
         *
         * @member {number}
         * @private
         */
        this._verticesID = 0;

        this._lastVerticesID = -1;

        /**
         *  Version counter for uvs updates
         *
         * @member {number}
         * @private
         */
        this._uvsID = 0;

        this._lastUvsID = -1;

        /**
         * anchor for a plane
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        this._anchor = new core.ObservablePoint(this.invalidateVertices, this);

        this.drawMode = Mesh.DRAW_MODES.TRIANGLES;
        this.refresh();
    }

    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get verticesX()
    {
        return this._verticesX;
    }

    set verticesX(value) // eslint-disable-line require-jsdoc
    {
        if (this._verticesX === value)
        {
            return;
        }
        this._verticesX = value;
        this._dimensionsID++;
    }

    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get verticesY()
    {
        return this._verticesY;
    }

    set verticesY(value) // eslint-disable-line require-jsdoc
    {
        if (this._verticesY === value)
        {
            return;
        }
        this._verticesY = value;
        this._dimensionsID++;
    }

    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width()
    {
        return this._width || this.texture.orig.width;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        if (this._width === value)
        {
            return;
        }
        this._width = value;
        this._verticesID++;
    }

    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height()
    {
        return this._height || this.texture.orig.height;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        if (this._height === value)
        {
            return;
        }
        this._height = value;
        this._verticesID++;
    }

    /**
     * The anchor sets the origin point of the texture.
     * The default is 0,0 this means the texture's origin is the top left
     * Setting the anchor to 0.5,0.5 means the texture's origin is centered
     * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
     *
     * @member {PIXI.ObservablePoint}
     */
    get anchor()
    {
        return this._anchor;
    }

    set anchor(value) // eslint-disable-line require-jsdoc
    {
        this._anchor.copy(value);
    }

    /**
     * Call when you updated some parameters manually
     */
    invalidateVertices()
    {
        this._verticesID++;
    }

    /**
     * Call when you updated some parameters manually
     */
    invalidateUvs()
    {
        this._uvsID++;
    }

    /**
     * Call when you updated some parameters manually
     */
    invalidate()
    {
        this._verticesID++;
        this._uvsID++;
    }

    /**
     * Refreshes uvs for generated meshes (rope, plane)
     * sometimes refreshes vertices too
     *
     * @param {boolean} [forceUpdate=false] if true, everything will be updated in any case
     */
    refresh(forceUpdate)
    {
        if (!this._texture.valid)
        {
            return;
        }

        this.refreshDimensions(forceUpdate);

        if (this._lastWidth !== this.width
            && this._lastHeight !== this.height)
        {
            this._lastWidth = this.width;
            this._lastHeight = this.height;
            this._verticesID++;
        }

        if (this._uvTransform.update(forceUpdate))
        {
            this._uvsID++;
        }

        if (this._uvsID !== this._lastUvsID)
        {
            this._refreshUvs();
        }

        this.refreshVertices();
    }

    /**
     * Refreshes structure of the plane mesh
     * when its done, refreshes vertices and uvs too
     *
     * @param {boolean} [forceUpdate=false] if true, dimensions will be updated any case
     */
    refreshDimensions(forceUpdate)
    {
        // won't be overwritten, that's why there's no private method

        if (!forceUpdate && this._lastDimensionsID === this._dimensionsID)
        {
            return;
        }

        this._lastDimensionsID = this._dimensionsID;
        this._verticesID++;
        this._uvsID++;

        const total = this.verticesX * this.verticesY;

        const segmentsX = this.verticesX - 1;
        const segmentsY = this.verticesY - 1;

        const indices = [];
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
        this.indices = new Uint16Array(indices);
        this.uvs = new Float32Array(total * 2);
        this.vertices = new Float32Array(total * 2);

        this.indexDirty++;
    }

    /**
     * Refreshes plane UV coordinates
     *
     */
    _refreshUvs()
    {
        this._uvsID = this._lastUvsID;

        const total = this.verticesX * this.verticesY;
        const uvs = this.uvs;

        const segmentsX = this.verticesX - 1;
        const segmentsY = this.verticesY - 1;

        for (let i = 0; i < total; i++)
        {
            const x = (i % this.verticesX);
            const y = ((i / this.verticesX) | 0);

            uvs[i * 2] = x / segmentsX;
            uvs[(i * 2) + 1] = y / segmentsY;
        }

        this.dirty++;

        this.multiplyUvs();
    }

    /**
     * Refreshes plane vertices coords
     * by default, makes them uniformly distributed
     *
     * @param {boolean} [forceUpdate=false] if true, vertices will be updated any case
     */
    refreshVertices(forceUpdate)
    {
        const texture = this._texture;

        if (texture.noFrame)
        {
            return;
        }

        if (forceUpdate || this._lastVerticesID !== this._verticesID)
        {
            this._lastVerticesID = this._verticesID;
            this._refreshVertices();
        }
    }

    /**
     * Refreshes vertices of Plane mesh
     * by default, makes them uniformly distributed
     *
     * @private
     */
    _refreshVertices()
    {
        const total = this.verticesX * this.verticesY;
        const vertices = this.vertices;

        const segmentsX = this.verticesX - 1;
        const segmentsY = this.verticesY - 1;

        const sizeX = this.width / segmentsX;
        const sizeY = this.height / segmentsY;
        const offsetX = -this.width * this.anchor.x;
        const offsetY = -this.height * this.anchor.y;

        for (let i = 0; i < total; i++)
        {
            const x = (i % this.verticesX);
            const y = ((i / this.verticesX) | 0);

            vertices[i * 2] = (x * sizeX) + offsetX;
            vertices[(i * 2) + 1] = (y * sizeY) + offsetY;
        }
    }
}
