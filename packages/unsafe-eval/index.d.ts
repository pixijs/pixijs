import type { systems } from '@pixi/core';

export declare function install(PIXI: PIXICore): void;

declare interface PIXICore {
    systems?: typeof systems;
}

export { };
