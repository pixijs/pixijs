import { Container } from '../../scene/Container';
import { MeshView } from './MeshView';

import type { Texture } from '../../renderers/shared/texture/Texture';
import type { ContainerOptions } from '../../scene/Container';
import type { MeshGeometry } from './MeshGeometry';
import type { MeshViewOptions } from './MeshView';

export type MeshOptions = ContainerOptions<MeshView> & MeshViewOptions;

export class Mesh extends Container<MeshView>
{
    constructor(options: MeshOptions)
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

    set geometry(value: MeshGeometry)
    {
        this.view.geometry = value;
    }
}

