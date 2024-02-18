import CheckImageBitmapWorker from 'worker:./workers/checkImageBitmap.worker.ts';
import LoadImageBitmapWorker from 'worker:./workers/loadImageBitmap.worker.ts';

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
    private resolveHash: {
        [key: string]: {
            resolve: (...param: any[]) => void;
            reject: (...param: any[]) => void;
        }
    };
    private readonly workerPool: Worker[];
    private readonly queue: {
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
        this.workerPool = [];
        this.queue = [];

        this.resolveHash = {};
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

    public loadImageBitmap(src: string): Promise<ImageBitmap>
    {
        return this._run('loadImageBitmap', [src]) as Promise<ImageBitmap>;
    }

    private async _initWorkers()
    {
        if (this._initialized) return;

        this._initialized = true;
    }

    private getWorker(): Worker
    {
        if (MAX_WORKERS === undefined)
        {
            MAX_WORKERS = navigator.hardwareConcurrency || 4;
        }
        let worker = this.workerPool.pop();

        if (!worker && this._createdWorkers < MAX_WORKERS)
        {
            // only create as many as MAX_WORKERS allows..
            this._createdWorkers++;
            worker = (new LoadImageBitmapWorker()).worker;

            worker.addEventListener('message', (event: MessageEvent) =>
            {
                this.complete(event.data);

                this.returnWorker(event.target as Worker);
                this.next();
            });
        }

        return worker;
    }

    private returnWorker(worker: Worker)
    {
        this.workerPool.push(worker);
    }

    private complete(data: LoadImageBitmapResult): void
    {
        if (data.error !== undefined)
        {
            this.resolveHash[data.uuid].reject(data.error);
        }
        else
        {
            this.resolveHash[data.uuid].resolve(data.data);
        }

        this.resolveHash[data.uuid] = null;
    }

    private async _run(id: string, args: any[]): Promise<any>
    {
        await this._initWorkers();
        // push into the queue...

        const promise = new Promise((resolve, reject) =>
        {
            this.queue.push({ id, arguments: args, resolve, reject });
        });

        this.next();

        return promise;
    }

    private next(): void
    {
        // nothing to do
        if (!this.queue.length) return;

        const worker = this.getWorker();

        // no workers available...
        if (!worker)
        {
            return;
        }

        const toDo = this.queue.pop();

        const id = toDo.id;

        this.resolveHash[UUID] = { resolve: toDo.resolve, reject: toDo.reject };

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
