/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dNodeExtensions } from '../Gl2DExtensions';
import { type Gl2dContainerNode, type Gl2dSpriteNode } from '../Gl2dNodes';
import { type Gl2dPoint2d, type Gl2dRectangle } from '../Gl2dTypes';
import { type Gl2dPixiBlendMode } from './PixiGl2dTypes';

export type Gl2dPixiNode = Gl2dPixiContainerNode | Gl2dPixiSpriteNode;
export type Gl2dPixiNodeExtensions = Gl2dPixiContainerNodeExtensions;

export type Gl2dPixiNodeExtensionName = keyof Gl2dPixiNodeExtensions;

interface Gl2dPixiContainerNodeExtensions extends Gl2dNodeExtensions
{
    pixi_container_node: {
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
        // Events
        eventMode?: 'none' | 'passive' | 'auto' | 'static' | 'dynamic';
        interactiveChildren?: boolean;
        cursor?: string;
        // Accessibility
        accessible?: boolean;
        accessibleChildren?: boolean;
        accessibleHint?: string;
        accessiblePointerEvents?: string;
        accessibleText?: string;
        accessibleTitle?: string;
        accessibleType?: string;
        tabIndex?: number;
        // Culling
        cullArea?: Gl2dRectangle;
        cullableChildren?: boolean;
        cullable?: boolean;
    };
}
export interface Gl2dPixiContainerNode extends Gl2dContainerNode
{
    extensions: Gl2dPixiContainerNodeExtensions;
}

export interface Gl2dPixiSpriteNode extends Gl2dSpriteNode
{
    extensions: Gl2dPixiContainerNodeExtensions;
}
