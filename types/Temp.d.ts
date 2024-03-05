declare module '*.worker.js'
{
    class WebWorkerInstance
    {
        public worker: Worker;
        constructor();

        public static revokeObjectURL(): void;
    }

    export default WebWorkerInstance;
}

declare module '*.worker.ts'
{
    class WebWorkerInstance
    {
        public worker: Worker;
        constructor();

        public static revokeObjectURL(): void;
    }

    export default WebWorkerInstance;
}
