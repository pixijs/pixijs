/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dNodeExtensions } from './Gl2DExtensions';
import { type Gl2dBlendMode, type Gl2dMaskOptions, type Gl2dPoint2d, type Gl2dRef } from './Gl2dTypes';

export type Gl2dNode = Gl2dContainerNode | Gl2dSpriteNode | Gl2dCustomNode;

export interface Gl2dBaseNode
{
    type: string;
    uid: string;
    name?: string;
    children?: Gl2dRef[];
    translation?: Gl2dPoint2d;
    rotation?: number;
    scale?: Gl2dPoint2d;
    alpha?: number;
    visible?: boolean;
    blendMode?: Gl2dBlendMode;
    mask?: Gl2dMaskOptions;
    extensions?: Gl2dNodeExtensions;
}

export interface Gl2dContainerNode extends Gl2dBaseNode
{
    type: 'container';
}

export interface Gl2dSpriteNode extends Gl2dBaseNode
{
    type: 'sprite';
    texture: Gl2dRef;
}

export interface Gl2dCustomNode extends Gl2dBaseNode
{
    type: string;
}
