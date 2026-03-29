/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import {
    type Gl2dNodeExtensionName,
    type Gl2dNodeExtensionRegistry,
    type Gl2dNodeExtensions,
    type ReplaceExtensions,
} from '../Gl2DExtensions';
import {
    type Gl2dContainerNode,
    type Gl2dNineSliceSpriteNode,
    type Gl2dSpriteNode,
    type Gl2dTilingSpriteNode,
} from '../Gl2dNodes';
import { type Gl2dPoint2d, type Gl2dRectangle } from '../Gl2dTypes';
import { type Gl2dPixiBlendMode } from './PixiGl2dTypes';

export interface Gl2dPixiContainerNodeExtension
{
    origin?: Gl2dPoint2d;
    skew?: Gl2dPoint2d;
    pivot?: Gl2dPoint2d;
    anchor?: Gl2dPoint2d;
    width?: number;
    height?: number;
    tint?: string;
    blendMode?: Gl2dPixiBlendMode;
    roundPixels?: boolean;
    zIndex?: number;
    isRenderGroup?: boolean;
    renderable?: boolean;
    boundsArea?: Gl2dRectangle;
    sortableChildren?: boolean;
    eventMode?: 'none' | 'passive' | 'auto' | 'static' | 'dynamic';
    interactiveChildren?: boolean;
    cursor?: string;
    accessible?: boolean;
    accessibleChildren?: boolean;
    accessibleHint?: string;
    accessiblePointerEvents?: string;
    accessibleText?: string;
    accessibleTitle?: string;
    accessibleType?: string;
    tabIndex?: number;
    cullArea?: Gl2dRectangle;
    cullableChildren?: boolean;
    cullable?: boolean;
}

export interface Gl2dPixiTilingSpriteNodeExtension
{
    applyAnchorToTexture?: boolean;
    clampMargin?: number;
}

declare module '../Gl2DExtensions'
{
    interface Gl2dNodeExtensionRegistry
    {
        pixi_container_node: Gl2dPixiContainerNodeExtension;
        pixi_tiling_sprite_node: Gl2dPixiTilingSpriteNodeExtension;
    }
}

type Gl2dPixiNodeExtensionKeys = Extract<
    'gl2d_filters' | 'pixi_container_node' | 'pixi_tiling_sprite_node',
    Gl2dNodeExtensionName
>;

type ReplaceNodeExtensions<T, K extends Gl2dNodeExtensionName> =
    ReplaceExtensions<T, Gl2dNodeExtensionRegistry, K>;

export type Gl2dPixiNodeExtensions<
    TKeys extends Gl2dNodeExtensionName = Gl2dPixiNodeExtensionKeys,
> = Gl2dNodeExtensions<TKeys>;

export type Gl2dPixiNodeExtensionName = Extract<
    Gl2dNodeExtensionName,
    `pixi_${string}`
>;

export type Gl2dPixiContainerNode = ReplaceNodeExtensions<
    Gl2dContainerNode<Gl2dPixiNodeExtensionKeys>,
    Gl2dPixiNodeExtensionKeys
>;

export type Gl2dPixiSpriteNode = ReplaceNodeExtensions<
    Gl2dSpriteNode<Gl2dPixiNodeExtensionKeys>,
    Gl2dPixiNodeExtensionKeys
>;

export type Gl2dPixiTilingSpriteNode = ReplaceNodeExtensions<
    Gl2dTilingSpriteNode<Gl2dPixiNodeExtensionKeys>,
    Gl2dPixiNodeExtensionKeys
>;

export type Gl2dPixiNineSliceSpriteNode = ReplaceNodeExtensions<
    Gl2dNineSliceSpriteNode<Gl2dPixiNodeExtensionKeys>,
    Gl2dPixiNodeExtensionKeys
>;

export type Gl2dPixiNode =
    | Gl2dPixiContainerNode
    | Gl2dPixiSpriteNode
    | Gl2dPixiTilingSpriteNode
    | Gl2dPixiNineSliceSpriteNode;
