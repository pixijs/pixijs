export type BASISModuleCreator = (config: {
    locateFile: (file: string) => string
}) => {
    then: (result: (libktx: BASISModule) => void) => void
};

export type BasisTextureConstructor = new (data: Uint8Array) => BasisTexture;

export interface BASISModule
{
    initializeBasis(): void;

    BasisFile: BasisTextureConstructor;
}

export interface BasisTexture
{
    getNumImages(): number;
    getNumLevels(imageIndex: number): number;
    startTranscoding(): boolean;

    getImageWidth(imageIndex: number, levelIndex: number): number;
    getImageHeight(imageIndex: number, levelIndex: number): number;

    getImageTranscodedSizeInBytes(
        imageIndex: number,
        levelIndex: number,
        format: number
    ): number;

    transcodeImage(
        buffer: Uint8Array,
        imageIndex: number,
        levelIndex: number,
        format: number,
        unused: number,
        getAlphaForOpaqueFormats: number
    ): boolean;
}
