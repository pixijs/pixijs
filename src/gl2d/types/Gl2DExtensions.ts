/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dRef } from './Gl2dTypes';

export type Gl2dExtensionBag<TRegistry, TKeys extends keyof TRegistry> = {
    [K in TKeys]?: TRegistry[K];
};

export type ReplaceExtensions<
    T,
    TRegistry,
    TKeys extends keyof TRegistry,
> = T extends any ? Omit<T, 'extensions'> & {
    extensions?: Gl2dExtensionBag<TRegistry, TKeys>;
} : never;

export interface Gl2dNodeExtensionRegistry
{
    gl2d_filters: Gl2dFiltersExtension;
}

export type Gl2dNodeExtensionName = Extract<keyof Gl2dNodeExtensionRegistry, string>;

export type Gl2dNodeExtensions<
    TKeys extends Gl2dNodeExtensionName = Gl2dNodeExtensionName,
> = Gl2dExtensionBag<Gl2dNodeExtensionRegistry, TKeys>;

export interface Gl2dFiltersExtension
{
    filters: Gl2dRef[];
}
