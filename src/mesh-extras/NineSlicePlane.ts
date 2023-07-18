/* eslint-disable prefer-rest-params */
import { MeshView } from '../rendering/mesh/shared/MeshView';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { Container } from '../rendering/scene/Container';
import { deprecation } from '../utils/logging/deprecation';
import { NineSliceGeometry } from './NineSliceGeometry';

import type { ContainerOptions } from '../rendering/scene/Container';

export interface NineSliceSpriteOptions extends ContainerOptions<MeshView<NineSliceGeometry>>
{
    texture: Texture;
    leftWidth?: number;
    topHeight?: number;
    rightWidth?: number;
    bottomHeight?: number;
}

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+
 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 * @example
 * import { NineSlicePlane, Texture } from 'pixi.js';
 *
 * const plane9 = new NineSlicePlane(Texture.from('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 * @memberof PIXI
 */
export class NineSliceSprite extends Container<MeshView<NineSliceGeometry>>
{
    static defaultOptions: NineSliceSpriteOptions = {
        texture: Texture.EMPTY,
        leftWidth: 10,
        topHeight: 10,
        rightWidth: 10,
        bottomHeight: 10,
    };

    /**
     * @param options - Options to use
     * @param options.texture - The texture to use on the NineSlicePlane.
     * @param options.leftWidth - Width of the left vertical bar (A)
     * @param options.topHeight - Height of the top horizontal bar (C)
     * @param options.rightWidth - Width of the right vertical bar (B)
     * @param options.bottomHeight - Height of the bottom horizontal bar (D)
     * @param options.width - Width of the NineSlicePlane,
     * setting this will actually modify the vertices and not the UV's of this plane.
     * @param options.height - Height of the NineSlicePlane,
     * setting this will actually modify the vertices and not UV's of this plane.
     */
    constructor(options: NineSliceSpriteOptions | Texture)
    {
        if ((options instanceof Texture))
        {
            options = { texture: options };
        }

        options = { ...NineSliceSprite.defaultOptions, ...options };

        const texture = options.texture;

        const nineSliceGeometry = new NineSliceGeometry({
            width: texture.width,
            height: texture.height,
            originalWidth: texture.width,
            originalHeight: texture.height,
            leftWidth: options.leftWidth,
            topHeight: options.topHeight,
            rightWidth: options.rightWidth,
            bottomHeight: options.bottomHeight,
            textureMatrix: texture.textureMatrix.mapCoord,
        });

        super({
            view: new MeshView<NineSliceGeometry>({
                geometry: nineSliceGeometry,
                texture,
            }),
            label: 'NineSlicePlane',
            ...options
        });
    }

    // /** The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane. */
    get width(): number
    {
        return this.view.geometry.width;
    }

    set width(value: number)
    {
        this.view.geometry.updatePositions({
            width: value,
        });
    }

    get height(): number
    {
        return this.view.geometry.height;
    }

    set height(value: number)
    {
        this.view.geometry.updatePositions({
            height: value,
        });
    }

    get leftWidth(): number
    {
        return this.view.geometry._leftWidth;
    }

    set leftWidth(value: number)
    {
        this.view.geometry.updateUvs({
            leftWidth: value,
        });
    }

    get topHeight(): number
    {
        return this.view.geometry._topHeight;
    }

    set topHeight(value: number)
    {
        this.view.geometry.updateUvs({
            topHeight: value,
        });
    }

    get rightWidth(): number
    {
        return this.view.geometry._rightWidth;
    }

    set rightWidth(value: number)
    {
        this.view.geometry.updateUvs({
            rightWidth: value,
        });
    }

    get bottomHeight(): number
    {
        return this.view.geometry._bottomHeight;
    }

    set bottomHeight(value: number)
    {
        this.view.geometry.updateUvs({
            bottomHeight: value,
        });
    }

    get texture(): Texture
    {
        return this.view.texture;
    }

    set texture(value: Texture)
    {
        if (value === this.view.texture) return;

        // // calculate the matrix..
        this.view.geometry.updateUvs({
            originalWidth: value.width,
            originalHeight: value.height,
            textureMatrix: value.textureMatrix.mapCoord,
        });

        this.view.texture = value;
    }
}

export class NineSlicePlane extends NineSliceSprite
{
    constructor(options: NineSliceSpriteOptions | Texture)
    {
        if (options instanceof Texture)
        {
            // eslint-disable-next-line max-len
            deprecation('v8', 'NineSlicePlane now uses the options object {texture, leftWidth, rightWidth, topHeight, bottomHeight}');

            options = {
                texture: options,
                leftWidth: arguments[1],
                topHeight: arguments[2],
                rightWidth: arguments[3],
                bottomHeight: arguments[4],
            };
        }
        deprecation('v8', 'NineSlicePlane is deprecated. Use NineSliceSprite instead.');
        super(options);
    }
}
