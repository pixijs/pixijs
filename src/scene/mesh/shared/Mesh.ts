import { Polygon } from '../../../maths/shapes/Polygon';
import { Geometry } from '../../../rendering/renderers/shared/geometry/Geometry';
import { State } from '../../../rendering/renderers/shared/state/State';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';
import { Container } from '../../container/Container';
import { MeshGeometry } from './MeshGeometry';

import type { PointData } from '../../../maths/point/PointData';
import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { View } from '../../../rendering/renderers/shared/view/View';
import type { Bounds } from '../../container/bounds/Bounds';
import type { ContainerOptions } from '../../container/Container';
import type { DestroyOptions } from '../../container/destroyTypes';

const tempPolygon = new Polygon();

export interface TextureShader extends Shader
{
    texture: Texture;
}

/**
 * Constructor options used for `Mesh` instances. Extends {@link scene.MeshViewOptions}
 * ```js
 * const mesh = new Mesh({
 *    texture: Texture.from('assets/image.png'),
 *    geometry: new PlaneGeometry(),
 *    shader: Shader.from(VERTEX, FRAGMENT),
 * });
 * ```
 * @see {@link scene.Mesh}
 * @see {@link scene.MeshViewOptions}
 * @memberof scene
 */

/**
 * @memberof scene
 */
export interface MeshOptions<
    GEOMETRY extends Geometry = MeshGeometry,
    SHADER extends Shader = TextureShader
> extends ContainerOptions
{
    /**
     * Includes vertex positions, face indices, colors, UVs, and
     * custom attributes within buffers, reducing the cost of passing all
     * this data to the GPU. Can be shared between multiple Mesh objects.
     */
    geometry: GEOMETRY;
    /**
     * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
     * Can be shared between multiple Mesh objects.
     */
    shader?: SHADER;
    /** The state of WebGL required to render the mesh. */
    state?: State;
    /** The texture that the Mesh uses. Null for non-MeshMaterial shaders */
    texture?: Texture;
    /** Whether or not to round the x/y position. */
    roundPixels?: boolean;
}
/**
 * Base mesh class.
 *
 * This class empowers you to have maximum flexibility to render any kind of WebGL/WebGPU visuals you can think of.
 * This class assumes a certain level of WebGL/WebGPU knowledge.
 * If you know a bit this should abstract enough away to make your life easier!
 *
 * Pretty much ALL WebGL/WebGPU can be broken down into the following:
 * - Geometry - The structure and data for the mesh. This can include anything from positions, uvs, normals, colors etc..
 * - Shader - This is the shader that PixiJS will render the geometry with (attributes in the shader must match the geometry)
 * - State - This is the state of WebGL required to render the mesh.
 *
 * Through a combination of the above elements you can render anything you want, 2D or 3D!
 * @memberof scene
 */
export class Mesh<
    GEOMETRY extends Geometry = MeshGeometry,
    SHADER extends Shader = TextureShader
> extends Container implements View, Instruction
{
    public readonly renderPipeId = 'mesh';
    public readonly canBundle = true;
    public state: State;

    /** @ignore */
    public _texture: Texture;
    /** @ignore */
    public _geometry: GEOMETRY;
    /** @ignore */
    public _shader?: SHADER;

    public _roundPixels: 0 | 1 = 0;

    /**
     * @param {scene.MeshOptions} options - options for the mesh instance
     */
    constructor(options: MeshOptions<GEOMETRY, SHADER>);
    /** @deprecated since 8.0.0 */
    constructor(geometry: GEOMETRY, shader: SHADER, state?: State, drawMode?: Topology);
    constructor(...args: [MeshOptions<GEOMETRY, SHADER>] | [GEOMETRY, SHADER, State?, Topology?])
    {
        let options = args[0];

        if (options instanceof Geometry)
        {
            // #if _DEBUG
            deprecation(v8_0_0, 'Mesh: use new Mesh({ geometry, shader }) instead');
            // #endif

            options = {
                geometry: options,
                shader: args[1],
            } as MeshOptions<GEOMETRY, SHADER>;

            if (args[3])
            {
                // #if _DEBUG
                deprecation(v8_0_0, 'Mesh: drawMode argument has been removed, use geometry.topology instead');
                // #endif

                options.geometry.topology = args[3];
            }
        }

        const { geometry, shader, texture, roundPixels, state, ...rest } = options;

        super({
            label: 'Mesh',
            ...rest
        });

        this.allowChildren = false;

        this.shader = shader;
        this.texture = texture ?? (shader as unknown as TextureShader)?.texture ?? Texture.WHITE;
        this.state = state ?? State.for2d();

        this._geometry = geometry;
        this._geometry.on('update', this.onViewUpdate, this);

        this.roundPixels = roundPixels ?? false;
    }

    /**
     *  Whether or not to round the x/y position of the mesh.
     * @type {boolean}
     */
    get roundPixels()
    {
        return !!this._roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this._roundPixels = value ? 1 : 0;
    }

    /** Alias for {@link scene.Mesh#shader}. */
    get material()
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'mesh.material property has been removed, use mesh.shader instead');
        // #endif

        return this._shader;
    }

    /**
     * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
     * Can be shared between multiple Mesh objects.
     */
    set shader(value: SHADER)
    {
        if (this._shader === value) return;

        this._shader = value;
        this.onViewUpdate();
    }

    get shader()
    {
        return this._shader;
    }

    /**
     * Includes vertex positions, face indices, colors, UVs, and
     * custom attributes within buffers, reducing the cost of passing all
     * this data to the GPU. Can be shared between multiple Mesh objects.
     */
    set geometry(value: GEOMETRY)
    {
        if (this._geometry === value) return;

        this._geometry?.off('update', this.onViewUpdate, this);
        value.on('update', this.onViewUpdate, this);

        this._geometry = value;
        this.onViewUpdate();
    }

    get geometry()
    {
        return this._geometry;
    }

    /** The texture that the Mesh uses. Null for non-MeshMaterial shaders */
    set texture(value: Texture)
    {
        value ||= Texture.EMPTY;

        const currentTexture = this._texture;

        if (currentTexture === value) return;

        if (currentTexture && currentTexture.dynamic) currentTexture.off('update', this.onViewUpdate, this);
        if (value.dynamic) value.on('update', this.onViewUpdate, this);

        if (this.shader)
        {
            (this.shader as unknown as TextureShader).texture = value;
        }

        this._texture = value;
        this.onViewUpdate();
    }

    get texture()
    {
        return this._texture;
    }

    get batched()
    {
        if (this._shader) return false;

        if (this._geometry instanceof MeshGeometry)
        {
            if (this._geometry.batchMode === 'auto')
            {
                return this._geometry.positions.length / 2 <= 100;
            }

            return this._geometry.batchMode === 'batch';
        }

        return false;
    }

    /**
     * The local bounds of the mesh.
     * @type {rendering.Bounds}
     */
    get bounds()
    {
        return this._geometry.bounds;
    }

    /**
     * Adds the bounds of this object to the bounds object.
     * @param bounds - The output bounds object.
     */
    public addBounds(bounds: Bounds)
    {
        bounds.addBounds(this.geometry.bounds);
    }

    /**
     * Checks if the object contains the given point.
     * @param point - The point to check
     */
    public containsPoint(point: PointData)
    {
        const { x, y } = point;

        if (!this.bounds.containsPoint(x, y)) return false;

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

    /** @ignore */
    public onViewUpdate()
    {
        // increment from the 12th bit!
        this._didChangeId += 1 << 12;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        if (this.renderGroup)
        {
            this.renderGroup.onChildViewUpdate(this);
        }
    }

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
     */
    public destroy(options?: DestroyOptions): void
    {
        super.destroy(options);

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            this._texture.destroy(destroyTextureSource);
        }

        this._geometry?.off('update', this.onViewUpdate, this);

        this._texture = null;
        this._geometry = null;
        this._shader = null;
    }
}
