import { ExtensionType } from '../../../extensions/Extensions';
import { Ticker } from '../../../ticker/Ticker';

import type { System } from './system/System';

// start at one too keep it positive!
let uid = 1;

/**
 * The SchedulerSystem manages scheduled tasks with specific intervals.
 * @memberof rendering
 */
export class SchedulerSystem implements System<null>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'scheduler',
        priority: 0,
    } as const;

    private readonly _tasks: {
        func: (elapsed: number) => void;
        duration: number;
        start: number;
        last: number;
        repeat: boolean;
        id: number;
    }[] = [];

    /** Initializes the scheduler system and starts the ticker. */
    public init(): void
    {
        Ticker.system.add(this._update, this);
    }

    /**
     * Schedules a repeating task.
     * @param func - The function to execute.
     * @param duration - The interval duration in milliseconds.
     * @returns The unique identifier for the scheduled task.
     */
    public repeat(func: (elapsed: number) => void, duration: number): number
    {
        const id = uid++;

        this._tasks.push({
            func,
            duration,
            start: performance.now(),
            last: performance.now(),
            repeat: true,
            id
        });

        return id;
    }

    /**
     * Cancels a scheduled task.
     * @param id - The unique identifier of the task to cancel.
     */
    public cancel(id: number): void
    {
        for (let i = 0; i < this._tasks.length; i++)
        {
            if (this._tasks[i].id === id)
            {
                this._tasks.splice(i, 1);

                return;
            }
        }
    }

    /**
     * Updates and executes the scheduled tasks.
     * @private
     */
    private _update(): void
    {
        const now = performance.now();

        for (let i = 0; i < this._tasks.length; i++)
        {
            const task = this._tasks[i];

            if (now - task.last >= task.duration)
            {
                const elapsed = now - task.start;

                task.func(elapsed);
                task.last = now;
            }
        }
    }

    /**
     * Destroys the scheduler system and removes all tasks.
     * @internal
     * @ignore
     */
    public destroy(): void
    {
        Ticker.system.remove(this._update, this);

        this._tasks.length = 0;
    }
}
