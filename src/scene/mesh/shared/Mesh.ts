import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';
import { Container } from '../../container/Container';
import { definedProps } from '../../container/utils/definedProps';
import { MeshGeometry } from './MeshGeometry';
import { MeshView } from './MeshView';

import type { Topology } from '../../../rendering/renderers/shared/geometry/const';
import type { State } from '../../../rendering/renderers/shared/state/State';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { ContainerOptions } from '../../container/Container';
import type { MeshViewOptions, TextureShader } from './MeshView';

/**
 * Options for the {@link Mesh} constructor.
 * @memberof scene
 */
export type MeshOptions<
    GEOMETRY extends MeshGeometry = MeshGeometry,
    SHADER extends TextureShader = TextureShader
> = Partial<ContainerOptions<MeshView<GEOMETRY, SHADER>>> & MeshViewOptions<GEOMETRY, SHADER>;

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
    GEOMETRY extends MeshGeometry = MeshGeometry,
    SHADER extends TextureShader = TextureShader
> extends Container<MeshView<GEOMETRY, SHADER>>
{
    constructor(options: MeshOptions<GEOMETRY, SHADER>);
    /** @deprecated since 8.0.0 */
    constructor(geometry: GEOMETRY, shader: SHADER, state?: State, drawMode?: Topology);
    constructor(...args: [MeshOptions<GEOMETRY, SHADER>] | [GEOMETRY, SHADER, State?, Topology?])
    {
        let options = args[0];

        if (options instanceof MeshGeometry)
        {
            deprecation(v8_0_0, 'Mesh: use new Mesh({ geometry, shader }) instead');

            options = {
                geometry: options,
                shader: args[1],
            } as MeshOptions<GEOMETRY, SHADER>;

            if (args[3])
            {
                deprecation(v8_0_0, 'Mesh: drawMode argument has been removed, use geometry.topology instead');
                options.geometry.topology = args[3];
            }
        }

        const { geometry, shader, texture, ...rest } = options;

        super({
            view: new MeshView(definedProps({ geometry, shader, texture })),
            label: 'Mesh',
            ...rest
        });

        this.allowChildren = false;
    }

    /** The texture that the Mesh uses. Null for non-MeshMaterial shaders */
    get texture()
    {
        return this.view.texture;
    }

    set texture(value: Texture)
    {
        this.view.texture = value;
    }

    /**
     * Includes vertex positions, face indices, colors, UVs, and
     * custom attributes within buffers, reducing the cost of passing all
     * this data to the GPU. Can be shared between multiple Mesh objects.
     */
    get geometry()
    {
        return this.view.geometry;
    }

    set geometry(value: GEOMETRY)
    {
        this.view.geometry = value;
    }

    /** Alias for {@link scene.Mesh#shader}. */
    get material()
    {
        deprecation(v8_0_0, 'mesh.material property has been removed, use mesh.shader instead');

        return this.view.shader;
    }

    /**
     * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
     * Can be shared between multiple Mesh objects.
     */
    get shader()
    {
        return this.view.shader;
    }

    /** Whether or not to round the x/y position of the mesh. */
    get roundPixels()
    {
        return !!this.view.roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this.view.roundPixels = value ? 1 : 0;
    }
}
