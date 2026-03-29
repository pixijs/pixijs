/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dNodeExtensionName, type Gl2dNodeExtensions } from './Gl2DExtensions';
import {
    type Gl2dBlendMode,
    type Gl2dMaskOptions,
    type Gl2dMatrix2d,
    type Gl2dPoint2d,
    type Gl2dRef,
} from './Gl2dTypes';

export type Gl2dNodeTransform = Gl2dNodeMatrixTransform | Gl2dNodeTrsTransform;

export type Gl2dNodeWithExclusiveTransform<TNode extends Gl2dBaseNode<string, any>> =
    Omit<TNode, 'translation' | 'rotation' | 'scale' | 'matrix'> & Gl2dNodeTransform;

export interface Gl2dBaseNode<
    TType extends string = string,
    TExtensions extends Gl2dNodeExtensionName = Gl2dNodeExtensionName,
>
{
    type: TType;
    uid: string;
    name?: string;
    children?: Gl2dRef[];
    translation?: Gl2dPoint2d;
    rotation?: number;
    scale?: Gl2dPoint2d;
    matrix?: Gl2dMatrix2d;
    alpha?: number;
    visible?: boolean;
    blendMode?: Gl2dBlendMode;
    mask?: Gl2dMaskOptions;
    extensions?: Gl2dNodeExtensions<TExtensions>;
}

export type Gl2dNodeMatrixTransform = {
    matrix: Gl2dMatrix2d;
    translation?: never;
    rotation?: never;
    scale?: never;
};

export type Gl2dNodeTrsTransform = {
    matrix?: never;
    translation?: Gl2dPoint2d;
    rotation?: number;
    scale?: Gl2dPoint2d;
};

export type Gl2dContainerNode<
    TExtensions extends Gl2dNodeExtensionName = 'gl2d_filters',
> = Gl2dNodeWithExclusiveTransform<Gl2dBaseNode<'container', TExtensions>>;

export type Gl2dSpriteNode<
    TExtensions extends Gl2dNodeExtensionName = 'gl2d_filters',
> = Gl2dNodeWithExclusiveTransform<
    Gl2dBaseNode<'sprite', TExtensions> & {
        texture: Gl2dRef;
    }
>;

export type Gl2dTilingSpriteNode<
    TExtensions extends Gl2dNodeExtensionName = 'gl2d_filters',
> = Gl2dNodeWithExclusiveTransform<
    Gl2dBaseNode<'tiling_sprite', TExtensions> & {
        texture: Gl2dRef;
        width: number;
        height: number;
        tileScale?: Gl2dPoint2d;
        tilePosition?: Gl2dPoint2d;
        tileRotation?: number;
    }
>;

export type Gl2dNineSliceSpriteNode<
    TExtensions extends Gl2dNodeExtensionName = 'gl2d_filters',
> = Gl2dNodeWithExclusiveTransform<
    Gl2dBaseNode<'nine_slice_sprite', TExtensions> & {
        texture: Gl2dRef;
        width: number;
        height: number;
        leftWidth?: number;
        topHeight?: number;
        rightWidth?: number;
        bottomHeight?: number;
    }
>;

export interface Gl2dNodeRegistry
{
    container: Gl2dContainerNode;
    sprite: Gl2dSpriteNode;
    tiling_sprite: Gl2dTilingSpriteNode;
    nine_slice_sprite: Gl2dNineSliceSpriteNode;
}

export type Gl2dNodeKind = Extract<keyof Gl2dNodeRegistry, string>;

export type Gl2dNodeOf<
    TKind extends Gl2dNodeKind = Gl2dNodeKind,
> = Gl2dNodeRegistry[TKind];

export type Gl2dNode = Gl2dNodeOf;

export type Gl2dCustomNode<
    TType extends string = string,
    TExtensions extends Gl2dNodeExtensionName = Gl2dNodeExtensionName,
> = Gl2dNodeWithExclusiveTransform<Gl2dBaseNode<TType, TExtensions>>;
