let UUID = 0;
const MAX_WORKERS = navigator.hardwareConcurrency || 4;

const workerCode = {
    id: 'loadImageBitmap',
    code: `
    self.onmessage = function(event) {

        async function loadImageBitmap(url)
        {
            const response = await fetch(url); 
            const imageBlob =  await response.blob();
            const imageBitmap = await createImageBitmap(imageBlob);
            return imageBitmap;
        }
  
        loadImageBitmap(event.data.data[0]).then(imageBitmap => {
            self.postMessage({
                data: imageBitmap,
                uuid: event.data.uuid,
                id: event.data.id,
            }, [imageBitmap]);
        }).catch(error => {
            self.postMessage({
                data: null,
                uuid: event.data.uuid,
                id: event.data.id,
            });
        }); 
    }`,
};

const blob = new Blob([workerCode.code], { type: 'application/javascript' });
const workerURL = URL.createObjectURL(blob);

class WorkerManagerClass
{
    public worker: Worker;
    private resolveHash: {[key: string]: (...param: any[]) => void};
    private readonly workerPool: Worker[];
    private readonly queue: { id: string; arguments: any[]; resolve: (...param: any[]) => void }[];
    private _initialized = false;
    private _createdWorkers = 0;

    constructor()
    {
        this.workerPool = [];
        this.queue = [];

        this.resolveHash = {};
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
        let worker = this.workerPool.pop();

        if (!worker && this._createdWorkers < MAX_WORKERS)
        {
            // only create as many as MAX_WORKERS allows..
            this._createdWorkers++;
            worker = new Worker(workerURL);

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

    private complete(data: any): void
    {
        const result = data.data;

        this.resolveHash[data.uuid](result);

        this.resolveHash[data.uuid] = null;
    }

    private _run(id: string, args: any[]): Promise<any>
    {
        this._initWorkers();
        // push into the queue...

        const promise =  new Promise((resolve) =>
        {
            this.queue.push({ id, arguments: args, resolve });
        });

        this.next();

        return promise;

        Promise.resolve(null);
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

        this.resolveHash[UUID] = toDo.resolve;

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
