import { Polygon } from '../../../maths/shapes/Polygon';
import { State } from '../../../rendering/renderers/shared/state/State';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { emptyViewObserver } from '../../../rendering/renderers/shared/view/View';
import { uid } from '../../../utils/data/uid';

import type { PointData } from '../../../maths/point/PointData';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { View } from '../../../rendering/renderers/shared/view/View';
import type { Bounds } from '../../container/bounds/Bounds';
import type { DestroyOptions } from '../../container/destroyTypes';
import type { MeshGeometry } from './MeshGeometry';

const tempPolygon = new Polygon();

export interface TextureShader extends Shader
{
    texture: Texture;
}

export interface MeshViewOptions<
    GEOMETRY extends MeshGeometry = MeshGeometry,
    SHADER extends TextureShader = TextureShader
>
{
    geometry: GEOMETRY;
    shader?: SHADER;
    texture?: Texture;
}

export class MeshView<
    GEOMETRY extends MeshGeometry = MeshGeometry,
    SHADER extends TextureShader = TextureShader
>implements View
{
    public readonly uid: number = uid('meshView');
    public readonly renderPipeId = 'mesh';
    public readonly canBundle = true;
    public readonly owner = emptyViewObserver;
    public state = State.for2d();

    /** @ignore */
    public _texture: Texture;
    /** @ignore */
    public _geometry: GEOMETRY;
    /** @ignore */
    public _shader?: SHADER;

    public roundPixels: 0 | 1 = 0;

    constructor(options: MeshViewOptions<GEOMETRY, SHADER>)
    {
        this.shader = options.shader;
        this.texture = options.texture ?? this.shader?.texture ?? Texture.WHITE;

        this._geometry = options.geometry;
        this._geometry.on('update', this.onUpdate, this);
    }

    set shader(value: SHADER)
    {
        if (this._shader === value) return;

        this._shader = value;
        this.onUpdate();
    }

    get shader()
    {
        return this._shader;
    }

    set geometry(value: GEOMETRY)
    {
        if (this._geometry === value) return;

        this._geometry?.off('update', this.onUpdate, this);
        value.on('update', this.onUpdate, this);

        this._geometry = value;
        this.onUpdate();
    }

    get geometry()
    {
        return this._geometry;
    }

    set texture(value: Texture)
    {
        if (this._texture === value) return;

        if (this.shader)
        {
            this.shader.texture = value;
        }

        this._texture = value;
        this.onUpdate();
    }

    get texture()
    {
        return this._texture;
    }

    get batched()
    {
        if (this._shader) return false;

        if (this._geometry.batchMode === 'auto')
        {
            return this._geometry.positions.length / 2 <= 100;
        }

        return this._geometry.batchMode === 'batch';
    }

    public addBounds(bounds: Bounds)
    {
        bounds.addVertexData(this.geometry.positions, 0, this.geometry.positions.length);
    }

    public containsPoint(point: PointData)
    {
        const { x, y } = point;

        const vertices = this.geometry.getBuffer('aPosition').data;

        const points = tempPolygon.points;
        const indices = this.geometry.getIndex().data;
        const len = indices.length;
        const step = this.geometry.topology === 'triangle-strip' ? 3 : 1;

        for (let i = 0; i + 2 < len; i += step)
        {
            const ind0 = indices[i] * 2;
            const ind1 = indices[i + 1] * 2;
            const ind2 = indices[i + 2] * 2;

            points[0] = vertices[ind0];
            points[1] = vertices[ind0 + 1];
            points[2] = vertices[ind1];
            points[3] = vertices[ind1 + 1];
            points[4] = vertices[ind2];
            points[5] = vertices[ind2 + 1];

            if (tempPolygon.contains(x, y))
            {
                return true;
            }
        }

        return false;
    }

    /** Called when the geometry is updated. */
    protected onUpdate()
    {
        this.owner.onViewUpdate();
    }

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
     */
    public destroy(options: DestroyOptions = false): void
    {
        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            this._texture.destroy(destroyTextureSource);
        }

        this._geometry?.off('update', this.onUpdate, this);

        this._texture = null;
        this._geometry = null;
        this._shader = null;
    }
}

