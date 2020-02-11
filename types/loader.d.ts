declare namespace PIXI {
    export interface Loader {
        baseUrl: string;
        progress: number;
        loading: boolean;
        defaultQueryString: string;
        resources: IResourceDictionary;
        concurrency: number;

        add(...params: any[]): this;
        //tslint:disable-next-line:ban-types forbidden-types
        add(name: string, url: string, options?: ILoaderOptions, cb?: Function): this;
        //tslint:disable-next-line:ban-types forbidden-types
        add(obj: string | any | any[], options?: ILoaderOptions, cb?: Function): this;

        //tslint:disable-next-line:ban-types forbidden-types
        pre(fn: Function): this;
        //tslint:disable-next-line:ban-types forbidden-types
        use(fn: Function): this;
        reset(): this;
        //tslint:disable-next-line:ban-types forbidden-types
        load(cb?: (loader: Loader, resources: Partial<Record<string, LoaderResource>>) => void): this;

        destroy(): void;
    }

    export interface IResourceDictionary {
        [index: string]: LoaderResource;
    }

    export interface ITextureDictionary {
        [index: string]: Texture;
    }

    export interface ILoaderOptions {
        crossOrigin?: boolean | string;
        loadType?: number;
        xhrType?: string;
        metadata?: {
            loadElement?: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
            skipSource?: boolean;
            mimeType?: string | string[];
        };
    }

    export interface LoaderResource {
        name: string;
        url: string;
        extension: string;
        data: any;
        crossOrigin: boolean | string;
        loadType: number;
        xhrType: string;
        metadata: any;
        error: Error;
        xhr: XMLHttpRequest | null;
        children: LoaderResource[];
        type: number;
        progressChunk: number;
        isDataUrl: boolean;
        isComplete: boolean;
        isLoading: boolean;
        complete(): void;
        abort(message?: string): void;
        //tslint:disable-next-line:ban-types forbidden-types
        load(cb?: Function): void;
        texture: Texture;
        spineAtlas: any;
        spineData: any;
        spritesheet?: Spritesheet;
        textures?: ITextureDictionary;
    }

    namespace LoaderResource {
        function setExtensionLoadType(extname: string, loadType: number): void;
        function setExtensionXhrType(extname: string, xhrType: string): void;

        export enum STATUS_FLAGS {
            NONE = 0,
            DATA_URL = (1 << 0),
            COMPLETE = (1 << 1),
            LOADING = (1 << 2),
        }

        export enum TYPE {
            UNKNOWN = 0,
            JSON = 1,
            XML = 2,
            IMAGE = 3,
            AUDIO = 4,
            VIDEO = 5,
            TEXT = 6,
        }

        export enum LOAD_TYPE {

            /** Uses XMLHttpRequest to load the resource. */
            XHR = 1,
            /** Uses an `Image` object to load the resource. */
            IMAGE = 2,
            /** Uses an `Audio` object to load the resource. */
            AUDIO = 3,
            /** Uses a `Video` object to load the resource. */
            VIDEO = 4,
        }

        export enum XHR_RESPONSE_TYPE {
            /** string */
            DEFAULT = 'text',
            /** ArrayBuffer */
            BUFFER = 'arraybuffer',
            /** Blob */
            BLOB = 'blob',
            /** Document */
            DOCUMENT = 'document',
            /** Object */
            JSON = 'json',
            /** String */
            TEXT = 'text',
        }

        let EMPTY_GIF: string;
    }
}
