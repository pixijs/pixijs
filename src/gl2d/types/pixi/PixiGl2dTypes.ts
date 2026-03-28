/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dNodeExtensionName } from '../Gl2DExtensions';
import { type Gl2dResourceExtensionName } from '../Gl2DResources';
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

export type Gl2dPixiExtensionName =
    | Gl2dNodeExtensionName
    | Gl2dResourceExtensionName
    | Gl2dPixiNodeExtensionName
    | Gl2dPixiResourceExtensionName;

export type Gl2dPixiFile = Gl2dFile<Gl2dPixiNode, Gl2dPixiResource, Gl2dPixiExtensionName>;
