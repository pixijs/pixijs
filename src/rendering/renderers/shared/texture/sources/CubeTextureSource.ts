import { warn } from '../../../../../utils/logging/warn';
import { TextureSource } from './TextureSource';

import type { TextureSourceOptions } from './TextureSource';

/**
 * The 6 faces of a cube map.
 *
 * Naming matches common engine conventions:
 * - left/right: -X/+X
 * - bottom/top: -Y/+Y
 * - back/front: -Z/+Z
 * @category rendering
 * @advanced
 */
export interface CubeTextureFaces<T>
{
    left: T;
    right: T;
    top: T;
    bottom: T;
    front: T;
    back: T;
}

/**
 * Options for creating a {@link CubeTextureSource}.
 * @category rendering
 * @advanced
 */
export interface CubeTextureSourceOptions extends Omit<
    TextureSourceOptions<any>,
    'resource' | 'dimensions' | 'viewDimension' | 'arrayLayerCount'
>
{
    /**
     * The 6 face sources that make up the cube texture. Their size, resolution, format and alphaMode
     * replace the options of the same name.
     *
     * All faces must match in:
     * - size (pixelWidth / pixelHeight)
     * - resolution
     * - format
     * - alphaMode
     *
     * Leave it out for an empty cube to render into, sized by `width`, `height` and `resolution`.
     */
    faces?: CubeTextureFaces<TextureSource>;
}

/**
 * A {@link TextureSource} that represents a cube texture (6 faces).
 *
 * Internally, WebGPU uses a 2D texture with 6 array layers and a `cube` view.
 * WebGL uses `TEXTURE_CUBE_MAP`.
 * @example
 * Create a cube source from 6 already-created {@link TextureSource} instances:
 *
 * ```ts
 * const cubeSource = new CubeTextureSource({
 *   faces: { right, left, top, bottom, front, back },
 *   label: 'env-map',
 * });
 * ```
 * @example
 * Create an empty cube and render into each face. A face is an array layer, in the order
 * +X, -X, +Y, -Y, +Z, -Z (`right`, `left`, `top`, `bottom`, `front`, `back`):
 *
 * ```ts
 * const cubeSource = new CubeTextureSource({ width: 256, height: 256, format: 'rgba16float' });
 * const target = new RenderTarget({ colorTextures: [cubeSource], depth: true });
 *
 * for (let face = 0; face < 6; face++)
 * {
 *   // ...point `scene` along this face
 *   renderer.render({ container: scene, target, layer: face, clear: true });
 * }
 *
 * const cube = new CubeTexture({ source: cubeSource });
 * ```
 *
 * Inside a render, such as in a render pipe, bind a face with
 * `renderer.renderTarget.bind({ target, clear: true, layer: face })` and draw to it instead.
 * @category rendering
 * @advanced
 */
export class CubeTextureSource extends TextureSource<CubeTextureFaces<TextureSource>>
{
    /**
     * `'cube'` uploads the faces; an empty cube has nothing to upload, so it is allocated empty like a RenderTexture.
     * @internal
     */
    public override readonly uploadMethodId: string;

    /** The 6 face sources that make up this cube texture, or `undefined` for an empty cube. */
    public readonly faces: CubeTextureFaces<TextureSource>;

    constructor(options: CubeTextureSourceOptions)
    {
        const { faces, ...rest } = options;
        const first = faces?.right;

        if (faces)
        {
            // Validate faces are compatible (size/format/alpha/resolution).
            CubeTextureSource._validateFaces(faces);
        }

        // #if _DEBUG
        // CubeTextureSourceOptions omits the view keys, and faces decide the rest; warn if they are passed anyway.
        const ignoredKeys = ([
            ...(faces ? ['width', 'height', 'resolution', 'format', 'alphaMode'] : []),
            'dimensions',
            'viewDimension',
            'arrayLayerCount',
        ] as const).filter((key) => (rest as any)[key] !== undefined);

        if (ignoredKeys.length)
        {
            warn(
                `[CubeTextureSource] Ignoring option(s) [${ignoredKeys.join(', ')}]; `
                + 'a cube has 6 layers, and its size and format come from the faces when given.'
            );
        }
        // #endif

        super({
            ...rest,
            // Keep these aligned with the face sources so any code that reads width/height works.
            ...(faces && {
                resource: faces,
                width: first.width,
                height: first.height,
                resolution: first.resolution,
                format: first.format,
                alphaMode: first.alphaMode,
            }),
            viewDimension: 'cube',
            arrayLayerCount: 6,
        });

        this.uploadMethodId = faces ? 'cube' : 'unknown';
        this.faces = faces;

        if (!faces) return;

        // Forward face updates so the cube gets re-uploaded when any face changes.
        for (const key of Object.keys(faces) as (keyof CubeTextureFaces<TextureSource>)[])
        {
            const face = faces[key];

            face.on('update', this._onFaceUpdate, this);
            face.on('resize', this._onFaceResize, this);
            face.on('unload', this._onFaceUpdate, this);
        }
    }

    public override destroy(): void
    {
        const faces = this.faces;

        if (faces)
        {
            for (const key of Object.keys(faces) as (keyof CubeTextureFaces<TextureSource>)[])
            {
                const face = faces[key];

                face.off('update', this._onFaceUpdate, this);
                face.off('resize', this._onFaceResize, this);
                face.off('unload', this._onFaceUpdate, this);
            }
        }

        super.destroy();
    }

    private _onFaceUpdate()
    {
        this.emit('update', this);
    }

    private _onFaceResize(face: TextureSource)
    {
        // Re-validate and resize the cube source to match the face.
        CubeTextureSource._validateFaces(this.faces);

        this.resize(face.width, face.height, face.resolution);
    }

    private static _validateFaces(faces: CubeTextureFaces<TextureSource>): void
    {
        if (!faces.right || !faces.left || !faces.top || !faces.bottom || !faces.front || !faces.back)
        {
            throw new Error('[CubeTextureSource] Requires { left, right, top, bottom, front, back } faces.');
        }

        const first = faces.right;
        const expectedPixelWidth = first.pixelWidth;
        const expectedPixelHeight = first.pixelHeight;
        const expectedFormat = first.format;
        const expectedAlphaMode = first.alphaMode;
        const expectedResolution = first.resolution;

        for (const key of Object.keys(faces) as (keyof CubeTextureFaces<TextureSource>)[])
        {
            const face = faces[key];

            if (face.pixelWidth !== expectedPixelWidth || face.pixelHeight !== expectedPixelHeight)
            {
                throw new Error(`[CubeTextureSource] Face '${String(key)}' has a different size. All faces must match.`);
            }

            if (face.format !== expectedFormat)
            {
                throw new Error(`[CubeTextureSource] Face '${String(key)}' has a different format. All faces must match.`);
            }

            if (face.alphaMode !== expectedAlphaMode)
            {
                throw new Error(
                    `[CubeTextureSource] Face '${String(key)}' has a different alphaMode. All faces must match.`
                );
            }

            if (face.resolution !== expectedResolution)
            {
                throw new Error(
                    `[CubeTextureSource] Face '${String(key)}' has a different resolution. All faces must match.`
                );
            }
        }
    }
}

