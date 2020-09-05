import type { ShaderSystem } from '@pixi/core';

export declare function install(PIXI: PIXICore): void;

declare interface PIXICore {
    ShaderSystem: typeof ShaderSystem;
}

export { }
