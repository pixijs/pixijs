import type { ExtensionMetadata } from '../../extensions/Extensions';

/**
 * Format detection is useful for detecting feature support on the current platform.
 * @memberof assets
 */
export interface FormatDetectionParser
{
    /** Should be ExtensionType.DetectionParser */
    extension?: ExtensionMetadata;
    /** Browser/platform feature detection supported if return true  */
    test: () => Promise<boolean>,
    /**
     * Add formats (file extensions) to the existing list of formats.
     * Return an new array with added formats, do not mutate the formats argument.
     * @returns {Promise<string[]>} - Promise that resolves to the new formats array.
     */
    add: (formats: string[]) => Promise<string[]>,
    /**
     * Remove formats (file extensions) from the list of supported formats.
     * This is used when uninstalling this DetectionParser.
     * Return an new array with filtered formats, do not mutate the formats argument.
     * @returns {Promise<string[]>} - Promise that resolves to the new formats array.
     */
    remove: (formats: string[]) => Promise<string[]>,
}
