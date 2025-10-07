/**
 * Interface for HTMLImageElement.
 * @category environment
 * @advanced
 */
export interface ImageLike extends EventTarget
{
    /** Whether or not the image has completely loaded. */
    readonly complete: boolean;

    /** The Cross-Origin Resource Sharing (CORS) setting to use when retrieving the image. */
    crossOrigin: string | null;

    /** The URL of the image which is currently presented in the <img> element it represents. */
    readonly currentSrc: string;

    /** The width. */
    width: number;

    /** The height. */
    height: number;

    /** The address or URL of the a media resource that is to be considered. */
    src: string;

    /** Returns a Promise that resolves once the image is decoded. */
    decode(): Promise<void>;

    /** Removes the image from the DOM and cleans up resources. */
    remove(): void;

    onload: ((this: GlobalEventHandlers, ev: Event) => any) | null;
    onerror: ((this: GlobalEventHandlers, ev: Event) => any) | null;
}
