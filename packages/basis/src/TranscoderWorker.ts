import type { BASIS_FORMATS } from './Basis';
import type { ITranscodeResponse } from './TranscoderWorkerWrapper';
import { TranscoderWorkerWrapper } from './TranscoderWorkerWrapper';

/**
 * Worker class for transcoding *.basis files in background threads.
 *
 * To enable asynchronous transcoding, you need to provide the URL to the basis_universal transcoding
 * library.
 * @memberof PIXI.BasisParser
 */
export class TranscoderWorker
{
    // IMPLEMENTATION NOTE: TranscoderWorker tracks transcoding requests with a requestID; the worker can be issued
    // multiple requests (once it is initialized) and the response contains the requestID of the triggering request. Based on
    // the response, the transcodeAsync promise is fulfilled or rejected.

    // TODO: Publish our own @pixi/basis package & set default URL to jsdelivr/cdnjs
    /** URL for the script containing the basis_universal library. */
    static bindingURL: string;
    static jsSource: string;
    static wasmSource: ArrayBuffer;

    private static _onTranscoderInitializedResolve: () => void;

    /** a promise that when reslved means the transcoder is ready to be used */
    public static onTranscoderInitialized = new Promise<void>((resolve) =>
    {
        TranscoderWorker._onTranscoderInitializedResolve = resolve;
    });

    isInit: boolean;
    load: number;
    requests: { [id: number]: {
        resolve: (data: ITranscodeResponse) => void,
        reject: () => void
    } } = {};

    private static _workerURL: string;
    private static _tempID = 0;

    /** Generated URL for the transcoder worker script. */
    static get workerURL(): string
    {
        if (!TranscoderWorker._workerURL)
        {
            let workerSource = TranscoderWorkerWrapper.toString();

            const beginIndex = workerSource.indexOf('{');
            const endIndex = workerSource.lastIndexOf('}');

            workerSource = workerSource.slice(beginIndex + 1, endIndex);

            if (TranscoderWorker.jsSource)
            {
                workerSource = `${TranscoderWorker.jsSource}\n${workerSource}`;
            }

            TranscoderWorker._workerURL = URL.createObjectURL(new Blob([workerSource]));
        }

        return TranscoderWorker._workerURL;
    }

    protected worker: Worker;
    protected initPromise: Promise<void>;
    protected onInit: () => void;

    constructor()
    {
        this.isInit = false;
        this.load = 0;
        this.initPromise = new Promise((resolve) => { this.onInit = resolve; });

        if (!TranscoderWorker.wasmSource)
        {
            console.warn('resources.BasisResource.TranscoderWorker has not been given the transcoder WASM binary!');
        }

        this.worker = new Worker(TranscoderWorker.workerURL);
        this.worker.onmessage = this.onMessage;
        this.worker.postMessage({
            type: 'init',
            jsSource: TranscoderWorker.jsSource,
            wasmSource: TranscoderWorker.wasmSource
        });
    }

    /** @returns a promise that is resolved when the web-worker is initialized */
    initAsync(): Promise<void>
    {
        return this.initPromise;
    }

    /**
     * Creates a promise that will resolve when the transcoding of a *.basis file is complete.
     * @param basisData - *.basis file contents
     * @param rgbaFormat - transcoding format for RGBA files
     * @param rgbFormat - transcoding format for RGB files
     * @returns a promise that is resolved with the transcoding response of the web-worker
     */
    async transcodeAsync(
        basisData: Uint8Array,
        rgbaFormat: BASIS_FORMATS,
        rgbFormat: BASIS_FORMATS
    ): Promise<ITranscodeResponse>
    {
        ++this.load;

        const requestID = TranscoderWorker._tempID++;
        const requestPromise = new Promise((resolve: (data: ITranscodeResponse) => void, reject: () => void) =>
        {
            this.requests[requestID] = {
                resolve,
                reject
            };
        });

        this.worker.postMessage({
            requestID,
            basisData,
            rgbaFormat,
            rgbFormat,
            type: 'transcode'
        });

        return requestPromise;
    }

    /**
     * Handles responses from the web-worker
     * @param e - a message event containing the transcoded response
     */
    protected onMessage = (e: MessageEvent): void =>
    {
        const data = e.data as ITranscodeResponse;

        if (data.type === 'init')
        {
            if (!data.success)
            {
                throw new Error('BasisResource.TranscoderWorker failed to initialize.');
            }

            this.isInit = true;
            this.onInit();
        }
        else if (data.type === 'transcode')
        {
            --this.load;

            const requestID = data.requestID;

            if (data.success)
            {
                this.requests[requestID].resolve(data);
            }
            else
            {
                this.requests[requestID].reject();
            }

            delete this.requests[requestID];
        }
    };

    /**
     * Loads the transcoder source code
     * @param jsURL - URL to the javascript basis transcoder
     * @param wasmURL - URL to the wasm basis transcoder
     * @returns A promise that resolves when both the js and wasm transcoders have been loaded.
     */
    static loadTranscoder(jsURL: string, wasmURL: string): Promise<[void, void]>
    {
        const jsPromise = fetch(jsURL)
            .then((res: Response) => res.text())
            .then((text: string) => { TranscoderWorker.jsSource = text; });
        const wasmPromise = fetch(wasmURL)
            .then((res: Response) => res.arrayBuffer())
            .then((arrayBuffer: ArrayBuffer) => { TranscoderWorker.wasmSource = arrayBuffer; });

        return Promise.all([jsPromise, wasmPromise]).then((data) =>

        {
            this._onTranscoderInitializedResolve();

            return data;
        });
    }

    /**
     * Set the transcoder source code directly
     * @param jsSource - source for the javascript basis transcoder
     * @param wasmSource - source for the wasm basis transcoder
     */
    static setTranscoder(jsSource: string, wasmSource: ArrayBuffer): void
    {
        TranscoderWorker.jsSource = jsSource;
        TranscoderWorker.wasmSource = wasmSource;
    }
}
