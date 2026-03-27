/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type TextureStyle } from '../../../rendering/renderers/shared/texture/TextureStyle';
import {
    type Gl2dCustomResource,
    type Gl2dImageSourceResource,
    type Gl2dResourceExtensions,
    type Gl2dResourceType,
    type Gl2dSpritesheetResource,
    type Gl2dTextureResource,
    type Gl2dTextureSourceResource,
    type Gl2dVideoSourceResource,
} from '../Gl2DResources';
import { type Gl2dPoint2d, type Gl2dRectangle } from '../Gl2dTypes';

export type Gl2dPixiResource =
    | Gl2dPixiTextureResource
    | Gl2dPixiImageSourceResource
    | Gl2dPixiVideoSourceResource
    | Gl2dPixiSpritesheetResource;

export type Gl2dPixiResourceExtensionName = keyof Gl2dPixiResourceExtensions;

export type Gl2dPixiResourceExtensions = Gl2dResourceExtensions &
    Gl2dPixiTextureResource['extensions'] &
    Gl2dPixiTextureSourceResource['extensions'] &
    Gl2dPixiSpritesheetResource['extensions'] &
    Gl2dPixiImageSourceResource['extensions'] &
    Gl2dPixiVideoSourceResource['extensions'];

export type Gl2dPixiResourceType =
    | Exclude<Gl2dResourceType, Gl2dCustomResource['type']>
    | Gl2dPixiTextureResource['type']
    | Gl2dPixiImageSourceResource['type']
    | Gl2dPixiVideoSourceResource['type']
    | Gl2dPixiSpritesheetResource['type'];

export interface Gl2dPixiTextureResource extends Gl2dTextureResource
{
    extensions: {
        pixi_texture_resource: {
            orig?: Gl2dRectangle;
            trim?: Gl2dRectangle;
            defaultAnchor?: Gl2dPoint2d;
            defaultBorders?: [left: number, top: number, right: number, bottom: number];
            rotate?: number;
            dynamic?: boolean;
        };
    };
}

export interface Gl2dPixiTextureSourceResource extends Gl2dTextureSourceResource
{
    extensions: {
        pixi_texture_source_resource: {
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
        };
    };
}

export interface Gl2dPixiImageSourceResource extends Gl2dImageSourceResource
{
    extensions?: Gl2dResourceExtensions;
}

export interface Gl2dPixiVideoSourceResource extends Gl2dVideoSourceResource
{
    extensions?: Gl2dResourceExtensions;
}

export interface Gl2dPixiSpritesheetResource extends Gl2dSpritesheetResource
{
    extensions: {
        pixi_spritesheet: {
            cachePrefix?: string;
        };
    };
}
