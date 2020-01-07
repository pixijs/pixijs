declare module '@pixi/settings';
declare module '@pixi/constants';
declare module '@pixi/core' {
    interface Texture {
        destroy(): void;
    }

    interface BaseTexture {
        destroy(): void;
    }

    interface Program {}
}

declare type InteractionTrackingData = any;

declare interface IHitArea {
    contains(x: number, y: number): boolean;
}

declare interface InteractiveTarget {
    interactive: boolean;
    interactiveChildren: boolean;
    hitArea: IHitArea;
    cursor: string;
    buttonMode: boolean;
    trackedPointers: Map<number, InteractionTrackingData>;
}

declare interface IApplicationOptions {
    autoStart?: boolean;
    width?: number;
    height?: number;
    view?: HTMLCanvasElement;
    transparent?: boolean;
    autoDensity?: boolean;
    antialias?: boolean;
    preserveDrawingBuffer?: boolean;
    resolution?: number;
    forceCanvas?: boolean;
    backgroundColor?: number;
    clearBeforeRender?: boolean;
    forceFXAA?: boolean;
    powerPreference?: string;
    sharedTicker?: boolean;
    sharedLoader?: boolean;
    resizeTo?: Window | HTMLElement;
}
