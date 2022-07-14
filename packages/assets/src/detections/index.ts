import type { ExtensionMetadata } from '@pixi/core';

export interface FormatDetectionParser
{
    extension?: ExtensionMetadata;
    test: () => Promise<boolean>,
    add: (formats: string[]) => Promise<string[]>,
    remove: (formats: string[]) => Promise<string[]>,
}

export * from './parsers';
export * from './utils';
