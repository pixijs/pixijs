declare module '*.worker.js'
{
    class WorkerInstance extends Worker
    {
        constructor();

        public static revokeObjectURL(): void;
    }

    export default WorkerInstance;
}

declare module '*.worker.ts'
{
    class WorkerInstance extends Worker
    {
        constructor();

        public static revokeObjectURL(): void;
    }

    export default WorkerInstance;
}
