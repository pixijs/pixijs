import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';
import { Container } from '../../scene/Container';
import { MeshView } from './MeshView';

import type { Texture } from '../../renderers/shared/texture/Texture';
import type { ContainerOptions } from '../../scene/Container';
import type { MeshGeometry } from './MeshGeometry';
import type { MeshViewOptions, TextureShader } from './MeshView';

export type MeshOptions<
    GEOMETRY extends MeshGeometry = MeshGeometry,
    SHADER extends TextureShader = TextureShader
> = ContainerOptions<MeshView<GEOMETRY, SHADER>> & MeshViewOptions<GEOMETRY, SHADER>;

export class Mesh<
    GEOMETRY extends MeshGeometry = MeshGeometry,
    SHADER extends TextureShader = TextureShader
> extends Container<MeshView<GEOMETRY, SHADER>>
{
    constructor(options: MeshOptions<GEOMETRY, SHADER>)
    {
        super({
            view: new MeshView(options),
            label: 'Mesh',
            ...options
        });
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

