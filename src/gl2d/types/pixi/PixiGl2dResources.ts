/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type TextureStyle } from '../../../rendering/renderers/shared/texture/TextureStyle';
import { type ReplaceExtensions } from '../Gl2DExtensions';
import {
    type Gl2dGenericTextureSourceResource,
    type Gl2dImageSourceResource,
    type Gl2dResourceExtensionName,
    type Gl2dResourceExtensionRegistry,
    type Gl2dResourceExtensions,
    type Gl2dSpritesheetResource,
    type Gl2dTextureResource,
    type Gl2dTextureSourceResource,
    type Gl2dTextureSourceResourceType,
    type Gl2dVideoSourceResource,
} from '../Gl2DResources';
import { type Gl2dPoint2d, type Gl2dRectangle } from '../Gl2dTypes';

export interface Gl2dPixiTextureResourceExtension
{
    orig?: Gl2dRectangle;
    trim?: Gl2dRectangle;
    defaultAnchor?: Gl2dPoint2d;
    defaultBorders?: [left: number, top: number, right: number, bottom: number];
    rotate?: number;
    dynamic?: boolean;
}

export interface Gl2dPixiTextureSourceResourceExtension
{
    addressModeU?: TextureStyle['addressMode'];
    addressModeV?: TextureStyle['addressMode'];
    addressModeW?: TextureStyle['addressMode'];
    magFilter?: TextureStyle['magFilter'];
    minFilter?: TextureStyle['minFilter'];
    mipmapFilter?: TextureStyle['mipmapFilter'];
    lodMinClamp?: number;
    lodMaxClamp?: number;
    dimensions?: '1d' | '2d' | '3d';
    mipLevelCount?: number;
    autoGenerateMipmaps?: boolean;
    autoGarbageCollect?: boolean;
    compare?: TextureStyle['compare'];
    maxAnisotropy?: number;
}

export interface Gl2dPixiSpritesheetExtension
{
    cachePrefix?: string;
}

declare module '../Gl2DResources'
{
    interface Gl2dResourceExtensionRegistry
    {
        pixi_texture_resource: Gl2dPixiTextureResourceExtension;
        pixi_texture_source_resource: Gl2dPixiTextureSourceResourceExtension;
        pixi_spritesheet: Gl2dPixiSpritesheetExtension;
    }
}

type Gl2dPixiTextureExtensionKeys = Extract<
    'pixi_texture_resource',
    Gl2dResourceExtensionName
>;

type Gl2dPixiTextureSourceExtensionKeys = Extract<
    'pixi_texture_source_resource',
    Gl2dResourceExtensionName
>;

type Gl2dPixiSpritesheetExtensionKeys = Extract<
    'pixi_spritesheet',
    Gl2dResourceExtensionName
>;

type ReplaceResourceExtensions<T, K extends Gl2dResourceExtensionName> =
    ReplaceExtensions<T, Gl2dResourceExtensionRegistry, K>;

export type Gl2dPixiResourceExtensions<
    TKeys extends Gl2dResourceExtensionName = Gl2dResourceExtensionName,
> = Gl2dResourceExtensions<TKeys>;

export type Gl2dPixiResourceExtensionName = Extract<
    Gl2dResourceExtensionName,
    `pixi_${string}`
>;

export type Gl2dPixiTextureResource = ReplaceResourceExtensions<
    Gl2dTextureResource,
    Gl2dPixiTextureExtensionKeys
>;

export type Gl2dPixiTextureSourceResource<
    TType extends string = Gl2dTextureSourceResourceType,
> = ReplaceResourceExtensions<
    Gl2dTextureSourceResource<TType>,
    Gl2dPixiTextureSourceExtensionKeys
>;

export type Gl2dPixiGenericTextureSourceResource =
    ReplaceResourceExtensions<
        Gl2dGenericTextureSourceResource,
        Gl2dPixiTextureSourceExtensionKeys
    >;

export type Gl2dPixiImageSourceResource = ReplaceResourceExtensions<
    Gl2dImageSourceResource,
    Gl2dPixiTextureSourceExtensionKeys
>;

export type Gl2dPixiVideoSourceResource = ReplaceResourceExtensions<
    Gl2dVideoSourceResource,
    Gl2dPixiTextureSourceExtensionKeys
>;

export type Gl2dPixiSpritesheetResource = ReplaceResourceExtensions<
    Gl2dSpritesheetResource,
    Gl2dPixiSpritesheetExtensionKeys
>;

export type Gl2dPixiResource =
    | Gl2dPixiTextureResource
    | Gl2dPixiGenericTextureSourceResource
    | Gl2dPixiImageSourceResource
    | Gl2dPixiVideoSourceResource
    | Gl2dPixiSpritesheetResource;

export type Gl2dPixiResourceType = Gl2dPixiResource['type'];
