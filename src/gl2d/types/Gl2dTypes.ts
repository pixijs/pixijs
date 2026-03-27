/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dNodeExtensionName } from './Gl2DExtensions';
import { type Gl2dNode } from './Gl2dNodes';
import { type Gl2dResource } from './Gl2DResources';

export type Gl2dSerializerInput<T> = {
    [K in keyof T]-?: T[K] | null | undefined;
};

export type Gl2dRef = number | string;

export type Gl2dPoint2d = [x: number, y: number];

export type Gl2dMatrix2d = [a: number, b: number, c: number, d: number, tx: number, ty: number];

export type Gl2dRectangle = [x: number, y: number, width: number, height: number];

export type Gl2dCircle = [centerX: number, centerY: number, radius: number];

export type Gl2dBlendMode =
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'add'
    | 'subtract'
    | 'erase'
    | 'none';

export type Gl2dPixiBlendMode =
    | 'normal-npm'
    | 'add-npm'
    | 'screen-npm'
    | 'linear-burn'
    | 'linear-dodge'
    | 'linear-light'
    | 'pin-light'
    | 'vivid-light'
    | 'hard-mix'
    | 'negation'
    | 'min'
    | 'max'
    | 'divide';

export interface Gl2dMaskOptions
{
    node: Gl2dRef;
    inverse?: boolean;
}

export interface Gl2dFile
{
    asset: {
        version: string;
        generator?: string;
        minVersion?: string;
    };
    scene?: Gl2dRef;
    scenes?: {
        name: string;
        nodes: Gl2dRef[];
        width?: number;
        height?: number;
    }[];
    nodes?: Gl2dNode[];
    resources?: Gl2dResource[];
    extensionsUsed?: Gl2dNodeExtensionName[];
    extensionsRequired?: Gl2dNodeExtensionName[];
}
