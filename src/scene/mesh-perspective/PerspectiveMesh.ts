import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { PerspectivePlaneGeometry } from './PerspectivePlaneGeometry';

import type { MeshPlaneOptions } from '../mesh-plane/MeshPlane';
/**
 *
 * @see {@link scene.PerspectiveMesh}
 * @memberof scene
 */
export interface PerspectivePlaneOptions extends MeshPlaneOptions
{
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number,
    x3?: number,
    y3?: number,
    x4?: number,
    y4?: number
}

/**
 * @example
 * @memberof scene
 */
export class PerspectiveMesh extends Mesh<PerspectivePlaneGeometry>
{
    public static defaultOptions: PerspectivePlaneOptions = {
        texture: Texture.WHITE,
        verticesX: 10,
        verticesY: 10,
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
        x3: 100,
        y3: 100,
        x4: 0,
        y4: 100
    };
    /**
     * @param options - Options to be applied to MeshPlane
     */
    constructor(options: PerspectivePlaneOptions)
    {
        options = { ...PerspectiveMesh.defaultOptions, ...options };

        const { texture, verticesX, verticesY, ...rest } = options;
        const planeGeometry = new PerspectivePlaneGeometry(definedProps({
            width: texture.width,
            height: texture.height,
            verticesX,
            verticesY,
        }));

        super(definedProps({ ...rest, geometry: planeGeometry }));

        this._texture = texture;

        this.geometry.setCorners(
            options.x1, options.y1,
            options.x2, options.y2,
            options.x3, options.y3,
            options.x4, options.y4
        );
    }

    /**
     * Method used for overrides, to do something in case texture frame was changed.
     * Meshes based on plane can override it and change more details based on texture.
     */
    public textureUpdated(): void
    {
        const geometry: PerspectivePlaneGeometry = this.geometry as any;

        if (!geometry) return;

        const { width, height } = this.texture;

        if (geometry.width !== width || geometry.height !== height)
        {
            geometry.width = width;
            geometry.height = height;
            geometry.updateProjection();
        }
    }

    set texture(value: Texture)
    {
        if (this._texture === value) return;

        super.texture = value;

        this.textureUpdated();
    }

    /** The texture of the MeshPlane */
    get texture(): Texture
    {
        return this._texture;
    }
}
