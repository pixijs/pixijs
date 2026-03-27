/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dRef } from './Gl2dTypes';

export type Gl2dNodeExtensionName = keyof Gl2dNodeExtensions;

export type Gl2dNodeExtensions = {
    gl2d_filters?: Gl2dFiltersExtension;
};

export interface Gl2dFiltersExtension
{
    filters: Gl2dRef[];
}
