import CheckImageBitmapWorker from 'worker:./checkImageBitmap.worker.ts';
import LoadImageBitmapWorker from 'worker:./loadImageBitmap.worker.ts';

import type { TextureSourceOptions } from '../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { ResolvedAsset } from '../../types';

let UUID = 0;
let MAX_WORKERS: number;

type LoadImageBitmapResult = {
    data?: ImageBitmap,
    error?: Error,
    uuid: number,
    id: string,
};

class WorkerManagerClass
{
    public worker: Worker;
    private _resolveHash: {
        [key: string]: {
            resolve: (...param: any[]) => void;
            reject: (...param: any[]) => void;
        }
    };
    private readonly _workerPool: Worker[];
    private readonly _queue: {
        id: string;
        arguments: any[];
        resolve: (...param: any[]) => void;
        reject: (...param: any[]) => void;
    }[];
    private _initialized = false;
    private _createdWorkers = 0;
    private _isImageBitmapSupported?: Promise<boolean>;

    constructor()
    {
        this._workerPool = [];
        this._queue = [];

        this._resolveHash = {};
    }

    public isImageBitmapSupported(): Promise<boolean>
    {
        if (this._isImageBitmapSupported !== undefined) return this._isImageBitmapSupported;

        this._isImageBitmapSupported = new Promise((resolve) =>
        {
            const { worker } = new CheckImageBitmapWorker();

            worker.addEventListener('message', (event: MessageEvent<boolean>) =>
            {
                worker.terminate();
                CheckImageBitmapWorker.revokeObjectURL();
                resolve(event.data);
            });
        });

        return this._isImageBitmapSupported;
    }

    public loadImageBitmap(src: string, asset?: ResolvedAsset<TextureSourceOptions<any>>): Promise<ImageBitmap>
    {
        return this._run('loadImageBitmap', [src, asset?.data?.alphaMode]) as Promise<ImageBitmap>;
    }

    private async _initWorkers()
    {
        if (this._initialized) return;

        this._initialized = true;
    }

    private _getWorker(): Worker
    {
        if (MAX_WORKERS === undefined)
        {
            MAX_WORKERS = navigator.hardwareConcurrency || 4;
        }
        let worker = this._workerPool.pop();

        if (!worker && this._createdWorkers < MAX_WORKERS)
        {
            // only create as many as MAX_WORKERS allows..
            this._createdWorkers++;
            worker = new LoadImageBitmapWorker().worker;

            worker.addEventListener('message', (event: MessageEvent) =>
            {
                this._complete(event.data);

                this._returnWorker(event.target as Worker);
                this._next();
            });
        }

        return worker;
    }

    private _returnWorker(worker: Worker)
    {
        this._workerPool.push(worker);
    }

    private _complete(data: LoadImageBitmapResult): void
    {
        if (data.error !== undefined)
        {
            this._resolveHash[data.uuid].reject(data.error);
        }
        else
        {
            this._resolveHash[data.uuid].resolve(data.data);
        }

        this._resolveHash[data.uuid] = null;
    }

    private async _run(id: string, args: any[]): Promise<any>
    {
        await this._initWorkers();
        // push into the queue...

        const promise = new Promise((resolve, reject) =>
        {
            this._queue.push({ id, arguments: args, resolve, reject });
        });

        this._next();

        return promise;
    }

    private _next(): void
    {
        // nothing to do
        if (!this._queue.length) return;

        const worker = this._getWorker();

        // no workers available...
        if (!worker)
        {
            return;
        }

        const toDo = this._queue.pop();

        const id = toDo.id;

        this._resolveHash[UUID] = { resolve: toDo.resolve, reject: toDo.reject };

        worker.postMessage({
            data: toDo.arguments,
            uuid: UUID++,
            id,
        });
    }
}

const WorkerManager = new WorkerManagerClass();

export {
    WorkerManager,
};
