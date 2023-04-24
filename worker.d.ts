declare module '*.worker.ts'
{
    const WorkerFactory: new () => Worker;

    export default WorkerFactory;
}
