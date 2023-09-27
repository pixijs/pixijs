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

export type MeshOptions<
    GEOMETRY extends MeshGeometry = MeshGeometry,
    SHADER extends TextureShader = TextureShader
> = Partial<ContainerOptions<MeshView<GEOMETRY, SHADER>>> & MeshViewOptions<GEOMETRY, SHADER>;

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
                deprecation(v8_0_0, 'Mesh: topology argument has been removed, use geometry.topology instead');
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

    get texture()
    {
        return this.view.texture;
    }

    set texture(value: Texture)
    {
        this.view.texture = value;
    }

    get geometry()
    {
        return this.view.geometry;
    }

    set geometry(value: GEOMETRY)
    {
        this.view.geometry = value;
    }

    get material()
    {
        deprecation(v8_0_0, 'mesh.material property has been removed, use mesh.shader instead');

        return this.view.shader;
    }

    get shader()
    {
        return this.view.shader;
    }
}
