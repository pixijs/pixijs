// eslint-disable-next-line spaced-comment
/// <reference types="jest-extended" />

declare module '*.worker.ts'
{
    class WorkerInstance
    {
        public worker: Worker;

        constructor();

        static revokeObjectURL(): void;
    }

    export default WorkerInstance;
}

declare module '*.frag'
{
    const value: string;

    export default value;
}

declare module '*.vert'
{
    const value: string;

    export default value;
}
