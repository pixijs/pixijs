/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dNodeExtensionName } from '../Gl2DExtensions';
import { type Gl2dBlendMode, type Gl2dFile } from '../Gl2dTypes';
import { type Gl2dPixiNode, type Gl2dPixiNodeExtensionName } from './PixiGl2dNodes';
import { type Gl2dPixiResource, type Gl2dPixiResourceExtensionName } from './PixiGl2dResources';

export type Gl2dPixiBlendMode =
    | Gl2dBlendMode
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
    | 'divide'
    | 'inherit';

export interface Gl2dPixiFile extends Omit<Gl2dFile, 'extensionsUsed' | 'extensionsRequired'>
{
    nodes?: Gl2dPixiNode[];
    resources?: Gl2dPixiResource[];
    extensionsUsed?: (Gl2dNodeExtensionName | Gl2dPixiNodeExtensionName | Gl2dPixiResourceExtensionName)[];
    extensionsRequired?: (Gl2dNodeExtensionName | Gl2dPixiNodeExtensionName | Gl2dPixiResourceExtensionName)[];
}
