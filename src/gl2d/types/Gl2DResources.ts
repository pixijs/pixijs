/* eslint-disable requireMemberAPI/require-member-api-doc */
/* eslint-disable requireExport/require-export-jsdoc */

import { type Gl2dRectangle, type Gl2dRef } from './Gl2dTypes';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Gl2dResourceExtensions {}
export type Gl2dResource =
    | Gl2dTextureResource
    | Gl2dImageSourceResource
    | Gl2dVideoSourceResource
    | Gl2dSpritesheetResource
    | Gl2dCustomResource;

export type Gl2dResourceType =
    | Gl2dTextureResource['type']
    | Gl2dImageSourceResource['type']
    | Gl2dVideoSourceResource['type']
    | Gl2dSpritesheetResource['type']
    | Gl2dCustomResource['type'];

export type Gl2dAlphaMode = 'no-premultiply-alpha' | 'premultiply-alpha-on-upload' | 'premultiplied-alpha';
export type Gl2dWrapMode = 'repeat' | 'clamp' | 'mirror';
export type Gl2dScaleMode = 'linear' | 'nearest';

export interface Gl2dTextureResource
{
    type: 'texture';
    uid: `texture_resource_${string}`;
    name?: string;
    source: Gl2dRef;
    frame?: Gl2dRectangle;
    frameName?: string;
    extensions?: Gl2dResourceExtensions;
}

export interface Gl2dTextureSourceResource
{
    uid: string;
    name?: string;
    uri: string;
    width?: number;
    height?: number;
    resolution?: number;
    format?: string;
    antialias?: boolean;
    alphaMode?: Gl2dAlphaMode;
    addressMode?: Gl2dWrapMode;
    scaleMode?: Gl2dScaleMode;
    extensions?: Gl2dResourceExtensions;
}

export interface Gl2dImageSourceResource extends Gl2dTextureSourceResource
{
    type: 'image_source';
    uid: `image_source_${string}`;
}

export interface Gl2dVideoSourceResource extends Gl2dTextureSourceResource
{
    type: 'video_source';
    uid: `video_source_${string}`;
    autoLoad?: boolean;
    autoPlay?: boolean;
    crossorigin?: string;
    loop?: boolean;
    muted?: boolean;
    playsinline?: boolean;
    preload?: boolean;
    fps?: 'auto' | number;
}

export interface Gl2dSpritesheetResource
{
    type: 'spritesheet';
    uid: `spritesheet_${string}`;
    uri: string;
    source: Gl2dRef;
    extensions?: Gl2dResourceExtensions;
}

export interface Gl2dCustomResource
{
    type: string;
    uid: string;
    uri: string;
    name?: string;
    extensions?: Gl2dResourceExtensions;
    [key: string]: unknown;
}
