import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';

export type LIBKTXModuleCreator = (config: {
    locateFile: (file: string) => string
}) => {
    then: (result: (libktx: LIBKTXModule) => void) => void
};

export interface KTXTexture
{
    getImageData(level: number, layer: number, face: number): Uint8Array;
    glInternalformat: number;
    vkFormat: number
    classId: number;
    numLevels: number;
    baseHeight: number;
    baseWidth: number;
    transcodeBasis(transcodeFormat: any, arg1: number): unknown;
    needsTranscoding: boolean;
}

export interface LIBKTXModule
{
    ErrorCode: any;
    TranscodeTarget: any;
    ktxTexture: new (data: Uint8Array) => KTXTexture;
}

export type COMPRESSED_TEXTURE_FORMATS = TEXTURE_FORMATS | 'rgb8unorm' | 'rgb8unorm-srgb';
