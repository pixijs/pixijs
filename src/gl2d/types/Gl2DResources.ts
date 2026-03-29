/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dExtensionBag } from './Gl2DExtensions';
import { type Gl2dRectangle, type Gl2dRef } from './Gl2dTypes';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Gl2dResourceExtensionRegistry {}

export type Gl2dResourceExtensionName = Extract<keyof Gl2dResourceExtensionRegistry, string>;

export type Gl2dResourceExtensions<
    TKeys extends Gl2dResourceExtensionName = Gl2dResourceExtensionName,
> = Gl2dExtensionBag<Gl2dResourceExtensionRegistry, TKeys>;

export type Gl2dAlphaMode = 'no-premultiply-alpha' | 'premultiply-alpha-on-upload' | 'premultiplied-alpha';
export type Gl2dWrapMode = 'repeat' | 'clamp' | 'mirror';
export type Gl2dScaleMode = 'linear' | 'nearest';

export interface Gl2dResourceBase<
    TType extends string = string,
    TExtensions extends Gl2dResourceExtensionName = Gl2dResourceExtensionName,
>
{
    type: TType;
    uid: string;
    name: string;
    extensions?: Gl2dResourceExtensions<TExtensions>;
}

export type Gl2dTextureSourceResourceType = 'texture_source' | 'image_source' | 'video_source' | 'buffer_image_source';

export interface Gl2dTextureSourceResource<
    TType extends string = Gl2dTextureSourceResourceType,
    TExtensions extends Gl2dResourceExtensionName = Gl2dResourceExtensionName,
> extends Gl2dResourceBase<TType, TExtensions>
{
    uid: `${string}_${string}`;
    name: string;
    uri: string;
    width: number;
    height: number;
    resolution: number;
    format: string;
    antialias: boolean;
    alphaMode: Gl2dAlphaMode;
    addressMode: Gl2dWrapMode;
    scaleMode: Gl2dScaleMode;
}

export interface Gl2dGenericTextureSourceResource
    extends Gl2dTextureSourceResource<'texture_source'>
{
    uid: `texture_source_${string}`;
}

export interface Gl2dImageSourceResource
    extends Gl2dTextureSourceResource<'image_source'>
{
    uid: `image_source_${string}`;
}

export interface Gl2dVideoSourceResource
    extends Gl2dTextureSourceResource<'video_source'>
{
    uid: `video_source_${string}`;
    autoLoad: boolean;
    autoPlay: boolean;
    crossorigin: string;
    loop: boolean;
    muted: boolean;
    playsinline: boolean;
    preload: boolean;
    fps: 'auto' | number;
}

export interface Gl2dBufferImageSourceResource
    extends Omit<Gl2dTextureSourceResource<'buffer_image_source'>, 'uri'>
{
    uid: `buffer_image_source_${string}`;
    uri: number[];
}

export type Gl2dTextureSourceResourceRef = Gl2dRef;

type Gl2dTextureResourceBase = Gl2dResourceBase<'texture'> & {
    uid: `texture_resource_${string}`;
};

export type Gl2dTextureBackedTextureResource = Gl2dTextureResourceBase & {
    source: Gl2dTextureSourceResourceRef;
    frame: Gl2dRectangle;
    frameName?: never;
};

export type Gl2dSpritesheetBackedTextureResource = Gl2dTextureResourceBase & {
    source: Gl2dRef;
    frame?: never;
    frameName: string;
};

export type Gl2dTextureResource = Gl2dTextureBackedTextureResource | Gl2dSpritesheetBackedTextureResource;

export interface Gl2dSpritesheetResource
    extends Gl2dResourceBase<'spritesheet'>
{
    uid: `spritesheet_${string}`;
    uri: string;
    source: Gl2dTextureSourceResourceRef;
}

export interface Gl2dResourceRegistry
{
    texture: Gl2dTextureResource;
    texture_source: Gl2dGenericTextureSourceResource;
    image_source: Gl2dImageSourceResource;
    video_source: Gl2dVideoSourceResource;
    buffer_image_source: Gl2dBufferImageSourceResource;
    spritesheet: Gl2dSpritesheetResource;
}

export type Gl2dResourceKind = Extract<keyof Gl2dResourceRegistry, string>;

export type Gl2dResourceOf<
    TKind extends Gl2dResourceKind = Gl2dResourceKind,
> = Gl2dResourceRegistry[TKind];

export type Gl2dResource = Gl2dResourceOf;

export type Gl2dResourceType = Gl2dResource['type'];

export type Gl2dCustomResource<
    TType extends string = string,
    TExtensions extends Gl2dResourceExtensionName = Gl2dResourceExtensionName,
> = Gl2dResourceBase<TType, TExtensions> & {
    uri: string;
    [key: string]: unknown;
};
